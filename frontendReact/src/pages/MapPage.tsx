import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import {
  Box,
  Button,
  TextField,
  Typography,
  Slider,
  List,
  ListItem,
} from "@mui/material";

// Настройка кастомной иконки для маркеров
const customIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface MarkerData {
  id: number;
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
    setTimeout(() => {
      map.invalidateSize(); // Пересчёт размеров карты
    }, 100);
  }, [map]);

  return null;
};

const MapPage: React.FC = () => {
  const [markers, setMarkers] = useState<MarkerData[]>([
    {
      id: 1,
      name: "Озеро 1",
      lat: 59.9343,
      lng: 30.3351,
      address: "Адрес 1",
      rating: 4,
    },
    {
      id: 2,
      name: "Озеро 2",
      lat: 59.948,
      lng: 30.313,
      address: "Адрес 2",
      rating: 5,
    },
    {
      id: 3,
      name: "Озеро 3",
      lat: 59.960,
      lng: 30.300,
      address: "Адрес 3",
      rating: 3,
    },
  ]);

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
        marker.rating <= maxRating
    );
    setFilteredMarkers(filtered);
  };

  // Удаление маркеров
  const handleDeleteMarker = (id: number) => {
    const updatedMarkers = markers.filter((marker) => marker.id !== id);
    setMarkers(updatedMarkers);
    setFilteredMarkers(updatedMarkers);
  };

  return (
    <Box display="flex" flexDirection="column" height="100vh" position="relative">
      {/* Панель поиска и фильтров */}
      <Box
        position="absolute"
        top={16}
        left={16}
        zIndex={1000}
        padding={2}
        bgcolor="white"
        borderRadius={2}
        boxShadow="0px 4px 10px rgba(0, 0, 0, 0.1)"
        maxWidth={300}
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
        <Button variant="contained" color="primary" onClick={handleSearch} fullWidth>
          Применить фильтры
        </Button>
      </Box>

      {/* Карта */}
      <Box flex={1} display="flex" position="relative" width="100%">
        <MapContainer
          center={[59.9343, 30.3351]}
          zoom={12}
          style={{ height: "100%", width: "100%" }}
        >
          <ResizeHandler />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
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

