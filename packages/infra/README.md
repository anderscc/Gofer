# Gofer Infrastructure

Infrastructure as Code (IaC) for the Gofer platform using AWS CDK and CloudFormation.

## Architecture

The infrastructure is organized into several stacks:

- Search Stack (OpenSearch)
- API Stack (API Gateway + Lambda)
- Database Stack (DynamoDB)
- Storage Stack (S3)
- Monitoring Stack (CloudWatch)

## Prerequisites

- Node.js v18+
- AWS CLI configured
- AWS CDK CLI installed: `npm install -g aws-cdk`
- Required AWS permissions for deployment

## Configuration

Create environment-specific configuration files:

```bash
# .env.development
AWS_REGION=us-east-1
AWS_PROFILE=gofer-dev
ENVIRONMENT=development
VPC_ID=vpc-xxxxx
SUBNET_IDS=subnet-xxxxx,subnet-yyyyy
```

## Development

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Build the package:
   ```bash
   pnpm build
   ```

3. Deploy stacks:
   ```bash
   # Deploy all stacks
   pnpm deploy

   # Deploy specific stack
   pnpm deploy SearchStack
   ```

## Stack Details

### Search Stack

```typescript
// SearchStack configuration
const searchStack = new SearchStack(app, 'GoferSearchStack', {
  env: {
    region: process.env.AWS_REGION,
    account: process.env.AWS_ACCOUNT
  },
  opensearch: {
    domainName: 'gofer-search',
    capacity: {
      dataNodeInstanceType: 't3.small.search',
      dataNodes: 2
    },
    ebs: {
      volumeSize: 20
    }
  }
});
```

### Security Groups

Security groups are defined in `templates/security-groups.yaml`:

```yaml
Resources:
  ApiSecurityGroup:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupDescription: Security group for API Lambda functions
      VpcId: !Ref VpcId
      SecurityGroupIngress:
        - IpProtocol: tcp
          FromPort: 443
          ToPort: 443
          CidrIp: 0.0.0.0/0
```

## Directory Structure

- `src/`
  - `stacks/` - CDK stack definitions
  - `constructs/` - Custom CDK constructs
  - `config/` - Stack configuration
- `templates/` - CloudFormation templates
- `scripts/` - Deployment scripts

## Deployment

1. Bootstrap CDK (first time only):
   ```bash
   cdk bootstrap
   ```

2. Deploy to development:
   ```bash
   pnpm deploy:dev
   ```

3. Deploy to production:
   ```bash
   pnpm deploy:prod
   ```

## Monitoring

Infrastructure includes built-in monitoring:

- CloudWatch Dashboards
- Metric Alarms
- Log Groups
- X-Ray Tracing

## Security

Security best practices implemented:

- VPC isolation
- Security groups
- IAM least privilege
- KMS encryption
- WAF rules

## Cost Management

Cost optimization features:

- Auto-scaling policies
- Instance scheduling
- Reserved instances
- Budget alerts

## Contributing

See the main project README for contribution guidelines.
