import React from "react";
import { Box, Typography, Button, Checkbox, FormControlLabel } from "@mui/material";
import { Line } from "react-chartjs-2";

const Statistics: React.FC = () => {
  const data = {
    labels: ["Элемент 1", "Элемент 2", "Элемент 3", "Элемент 4", "Элемент 5"],
    datasets: [
      {
        label: "Пример данных",
        data: [10, 20, 30, 40, 50],
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgba(75,192,192,0.2)",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
      },
    },
  };

  return (
    <Box display="flex" flexDirection="column" padding={3} height="100vh" bgcolor="#f5f5f5">
      <Typography variant="h4" gutterBottom>
        Статистика
      </Typography>
      <Box flex={1} display="flex" flexDirection="row">
        {/* Боковая панель фильтров */}
        <Box width="20%" padding={2} bgcolor="#ffffff" borderRadius={2} boxShadow="0px 2px 5px rgba(0,0,0,0.1)">
          <Typography variant="h6">Фильтры</Typography>
          <FormControlLabel control={<Checkbox />} label="Фильтр 1" />
          <FormControlLabel control={<Checkbox />} label="Фильтр 2" />
          <FormControlLabel control={<Checkbox />} label="Фильтр 3" />
          <Button variant="contained" color="primary" fullWidth sx={{ marginTop: 2 }}>
            Применить
          </Button>
        </Box>

        {/* График */}
        <Box flex={1} marginLeft={3}>
          <Line data={data} options={options} />
        </Box>
      </Box>
      <Box display="flex" justifyContent="flex-end" marginTop={2}>
        <Button variant="contained" color="primary">
          Скачать
        </Button>
      </Box>
    </Box>
  );
};

export default Statistics;

