import * as cdk from 'aws-cdk-lib';
import * as opensearch from 'aws-cdk-lib/aws-opensearch';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources';
import { Construct } from 'constructs';

export class SearchStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create VPC for OpenSearch
    const vpc = new ec2.Vpc(this, 'SearchVPC', {
      maxAzs: 2,
      natGateways: 1,
    });

    // Create security group for OpenSearch
    const searchSG = new ec2.SecurityGroup(this, 'SearchSecurityGroup', {
      vpc,
      description: 'Security group for OpenSearch domain',
      allowAllOutbound: true,
    });

    // Create OpenSearch domain
    const domain = new opensearch.Domain(this, 'TasksSearchDomain', {
      version: opensearch.EngineVersion.OPENSEARCH_2_5,
      vpc,
      vpcSubnets: [{
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      }],
      securityGroups: [searchSG],
      capacity: {
        masterNodes: 0,
        dataNodes: 2,
        dataNodeInstanceType: 't3.small.search',
      },
      ebs: {
        volumeSize: 20,
        volumeType: ec2.EbsDeviceVolumeType.GP3,
      },
      zoneAwareness: {
        enabled: true,
        availabilityZoneCount: 2,
      },
      enforceHttps: true,
      nodeToNodeEncryption: true,
      encryptionAtRest: {
        enabled: true,
      },
      fineGrainedAccessControl: {
        masterUserName: process.env.OPENSEARCH_MASTER_USER || 'admin',
      },
    });

    // Create IAM role for Lambda functions
    const searchRole = new iam.Role(this, 'SearchRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      description: 'Role for Lambda functions to access OpenSearch',
    });

    // Add policy to allow Lambda to access OpenSearch
    searchRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'es:ESHttpGet',
        'es:ESHttpPost',
        'es:ESHttpPut',
        'es:ESHttpDelete',
      ],
      resources: [
        domain.domainArn,
        `${domain.domainArn}/*`,
      ],
    }));

    // Add VPC access policy
    searchRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaVPCAccessExecutionRole')
    );

    // Get reference to existing Tasks table
    const tasksTable = dynamodb.Table.fromTableArn(
      this,
      'TasksTable',
      cdk.Fn.importValue('TasksTableArn')
    );

    // Create the indexer Lambda function
    const indexerFunction = new lambda.Function(this, 'TaskIndexer', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'task-indexer.handler',
      code: lambda.Code.fromAsset('../api/dist'),
      timeout: cdk.Duration.minutes(5),
      memorySize: 1024,
      environment: {
        OPENSEARCH_DOMAIN_ENDPOINT: domain.domainEndpoint,
        OPENSEARCH_MASTER_USER: process.env.OPENSEARCH_MASTER_USER || 'admin',
        OPENSEARCH_MASTER_PASSWORD: process.env.OPENSEARCH_MASTER_PASSWORD || '',
      },
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      securityGroups: [searchSG],
      role: searchRole,
    });

    // Add DynamoDB stream as event source
    indexerFunction.addEventSource(
      new lambdaEventSources.DynamoEventSource(tasksTable, {
        startingPosition: lambda.StartingPosition.TRIM_HORIZON,
        batchSize: 100,
        retryAttempts: 3,
      })
    );

    // Add additional permissions for the Lambda role
    searchRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'dynamodb:GetRecords',
          'dynamodb:GetShardIterator',
          'dynamodb:DescribeStream',
          'dynamodb:ListStreams',
        ],
        resources: [tasksTable.tableArn, `${tasksTable.tableArn}/stream/*`],
      })
    );

    // Create outputs
    new cdk.CfnOutput(this, 'OpenSearchDomainEndpoint', {
      value: domain.domainEndpoint,
      description: 'OpenSearch domain endpoint',
      exportName: 'OpenSearchDomainEndpoint',
    });

    new cdk.CfnOutput(this, 'OpenSearchDomainName', {
      value: domain.domainName,
      description: 'OpenSearch domain name',
      exportName: 'OpenSearchDomainName',
    });

    new cdk.CfnOutput(this, 'SearchRoleArn', {
      value: searchRole.roleArn,
      description: 'ARN of the IAM role for search access',
      exportName: 'SearchRoleArn',
    });
  }
}
