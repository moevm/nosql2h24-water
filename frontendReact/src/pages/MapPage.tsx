import React, { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import {
  Box,
  Button,
  List,
  ListItem,
  Slider,
  TextField,
  Typography,
} from "@mui/material";
import "leaflet/dist/leaflet.css";

// Настройка кастомной иконки
const customIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface MarkerData {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  rating: number;
}

// Компонент для пересчёта размера карты
const ResizeHandler = () => {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize(); // Пересчёт размеров карты
  }, [map]);

  return null;
};

const MapPage: React.FC = () => {
  const [markers, setMarkers] = useState<MarkerData[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    fetch(`http://localhost:8000/points`, { signal })
      .then((data) => data.json())
      .then((data) => setMarkers(data))
      .catch((e) => console.error(e));

    return () => {
      controller.abort();
    };
  }, []);

  const [search, setSearch] = useState("");
  const [minRating, setMinRating] = useState(1);
  const [maxRating, setMaxRating] = useState(5);
  const [filteredMarkers, setFilteredMarkers] = useState(markers);

  // Функция для поиска и фильтрации маркеров
  const handleSearch = () => {
    const filtered = markers.filter(
      (marker) =>
        marker.name.toLowerCase().includes(search.toLowerCase()) &&
        marker.rating >= minRating &&
        marker.rating <= maxRating,
    );
    setFilteredMarkers(filtered);
  };

  // Удаление маркеров
  const handleDeleteMarker = (id: string) => {
    const updatedMarkers = markers.filter((marker) => marker.id !== id);
    setMarkers(updatedMarkers);
    setFilteredMarkers(updatedMarkers);
  };

  return (
    <Box display="flex" flexDirection="row" height="100vh">
      {/* Панель поиска и фильтров */}
      <Box
        width="300px"
        padding={2}
        bgcolor="white"
        borderRadius={2}
        boxShadow="0px 4px 10px rgba(0, 0, 0, 0.1)"
        zIndex={1000}
      >
        <Typography variant="h6" gutterBottom>
          Поиск
        </Typography>
        <TextField
          label="Введите название"
          variant="outlined"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
          sx={{ marginBottom: 2 }}
        />
        <Typography>Рейтинг</Typography>
        <Slider
          value={[minRating, maxRating]}
          onChange={(e, newValue) => {
            const [min, max] = newValue as number[];
            setMinRating(min);
            setMaxRating(max);
          }}
          valueLabelDisplay="auto"
          min={1}
          max={5}
          sx={{ marginBottom: 2 }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSearch}
          fullWidth
        >
          Применить фильтры
        </Button>
      </Box>

      {/* Карта */}
      <Box flex={1} position="relative">
        <MapContainer
          center={[59.9343, 30.3351]}
          zoom={12}
          style={{
            height: "100vh",
            width: "100%",
            background: "white",
          }}
          maxBounds={[
            [59.7, 29.9], // Левый нижний угол
            [60.2, 30.7], // Правый верхний угол
          ]}
          maxBoundsViscosity={1.0}
        >
          <ResizeHandler />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            tileSize={256}
            zoomOffset={0}
          />
          {filteredMarkers.map((marker) => (
            <Marker
              key={marker.id}
              position={[marker.lat, marker.lng]}
              icon={customIcon}
            >
              <Popup>
                <strong>{marker.name}</strong>
                <br />
                {marker.address}
                <br />
                Рейтинг: {marker.rating}
                <br />
                <Button
                  variant="contained"
                  color="secondary"
                  size="small"
                  onClick={() => handleDeleteMarker(marker.id)}
                >
                  Удалить
                </Button>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </Box>

      {/* Результаты поиска */}
      <Box
        position="absolute"
        bottom={16}
        left={16}
        zIndex={1000}
        padding={2}
        bgcolor="white"
        borderRadius={2}
        boxShadow="0px 4px 10px rgba(0, 0, 0, 0.1)"
        maxWidth={300}
        maxHeight="200px"
        overflow="auto"
      >
        <Typography variant="h6">Результаты</Typography>
        <List>
          {filteredMarkers.map((marker) => (
            <ListItem key={marker.id}>
              {marker.name} - {marker.address} (Рейтинг: {marker.rating})
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );
};

export default MapPage;
