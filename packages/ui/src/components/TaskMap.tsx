import { Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import MapView from 'react-native-maps';
import type { Task } from '../types';
import { colors } from '../theme';

interface TaskMapProps {
  tasks: Task[];
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  onTaskSelect?: (task: Task) => void;
}

export function TaskMap({ tasks, initialRegion, onTaskSelect }: TaskMapProps) {
  // For web, we'll use the Google Maps JavaScript API via WebView
  if (Platform.OS === 'web') {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="initial-scale=1.0, user-scalable=no">
          <style>
            #map { height: 100%; width: 100%; }
            html, body { height: 100%; margin: 0; padding: 0; }
          </style>
          <script src="https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}"></script>
          <script>
            function initMap() {
              const map = new google.maps.Map(document.getElementById('map'), {
                zoom: 12,
                center: { 
                  lat: ${initialRegion?.latitude || 0}, 
                  lng: ${initialRegion?.longitude || 0} 
                }
              });

              const tasks = ${JSON.stringify(tasks)};
              tasks.forEach(task => {
                const marker = new google.maps.Marker({
                  position: { 
                    lat: task.location.latitude, 
                    lng: task.location.longitude 
                  },
                  map,
                  title: task.title
                });

                marker.addListener('click', () => {
                  window.ReactNativeWebView.postMessage(JSON.stringify(task));
                });
              });
            }
          </script>
        </head>
        <body onload="initMap()">
          <div id="map"></div>
        </body>
      </html>
    `;

    return (
      <WebView
        style={{ flex: 1 }}
        source={{ html: htmlContent }}
        onMessage={(event) => {
          const task = JSON.parse(event.nativeEvent.data);
          onTaskSelect?.(task);
        }}
      />
    );
  }

  // For mobile, we'll use react-native-maps
  return (
    <MapView
      style={{ flex: 1 }}
      initialRegion={initialRegion}
    >
      {tasks.map((task) => (
        <MapView.Marker
          key={task.id}
          coordinate={{
            latitude: task.location.latitude,
            longitude: task.location.longitude,
          }}
          title={task.title}
          description={`${task.budget.currency} ${task.budget.amount}`}
          pinColor={colors.primary[500]}
          onPress={() => onTaskSelect?.(task)}
        />
      ))}
    </MapView>
  );
}
