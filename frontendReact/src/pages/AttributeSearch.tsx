import React, { useState } from "react";
import {
  Box,
  Typography,
  Slider,
  TextField,
  Button,
  Card,
  CardContent,
  CardMedia,
} from "@mui/material";

interface AttributeData {
  id: number;
  name: string;
  address: string;
  rating: number;
  image: string;
}

const AttributeSearch: React.FC = () => {
  const [minAttr1, setMinAttr1] = useState(0);
  const [maxAttr1, setMaxAttr1] = useState(1000);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredResults, setFilteredResults] = useState<AttributeData[]>([]);

  const data: AttributeData[] = [
    {
      id: 1,
      name: "Название озера 1",
      address: "Адрес 1",
      rating: 4,
      image: "https://via.placeholder.com/150",
    },
    {
      id: 2,
      name: "Название озера 2",
      address: "Адрес 2",
      rating: 5,
      image: "https://via.placeholder.com/150",
    },
    {
      id: 3,
      name: "Название озера 3",
      address: "Адрес 3",
      rating: 3,
      image: "https://via.placeholder.com/150",
    },
  ];

  const handleFilter = () => {
    const filtered = data.filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        item.rating >= minAttr1 &&
        item.rating <= maxAttr1
    );
    setFilteredResults(filtered);
  };

  return (
    <Box display="flex" flexDirection="row" height="100vh" padding={3} bgcolor="#f5f5f5">
      {/* Боковая панель фильтров */}
      <Box
        width="20%"
        bgcolor="white"
        padding={2}
        borderRadius={2}
        boxShadow="0px 2px 5px rgba(0,0,0,0.1)"
      >
        <Typography variant="h6">Фильтры</Typography>
        <TextField
          label="Поиск"
          variant="outlined"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ marginBottom: 2 }}
        />
        <Typography>Атрибут 1</Typography>
        <Slider
          value={[minAttr1, maxAttr1]}
          onChange={(e, newValue) => {
            const [min, max] = newValue as number[];
            setMinAttr1(min);
            setMaxAttr1(max);
          }}
          valueLabelDisplay="auto"
          min={0}
          max={1000}
          sx={{ marginBottom: 2 }}
        />
        <Button variant="contained" color="primary" fullWidth onClick={handleFilter}>
          Применить фильтры
        </Button>
      </Box>

      {/* Результаты */}
      <Box
        flex={1}
        display="flex"
        flexDirection="column"
        padding={2}
        bgcolor="white"
        borderRadius={2}
        boxShadow="0px 2px 5px rgba(0,0,0,0.1)"
        marginLeft={2}
      >
        <Typography variant="h6" gutterBottom>
          Результаты поиска
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={2}>
          {filteredResults.map((item) => (
            <Card key={item.id} sx={{ width: "30%" }}>
              <CardMedia
                component="img"
                height="140"
                image={item.image}
                alt={item.name}
              />
              <CardContent>
                <Typography variant="h6">{item.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.address}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Рейтинг: {item.rating}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default AttributeSearch;

