import React from "react";
import { Box, Typography, TextField, List, ListItem, Button } from "@mui/material";

const SupportStatistics: React.FC = () => {
  return (
    <Box display="flex" flexDirection="column" padding={3} height="100vh" bgcolor="#f5f5f5">
      <Typography variant="h4" gutterBottom>
        Статистика поддержки
      </Typography>
      <Box flex={1} display="flex" flexDirection="row">
        {/* Боковая панель поиска */}
        <Box width="20%" padding={2} bgcolor="#ffffff" borderRadius={2} boxShadow="0px 2px 5px rgba(0,0,0,0.1)">
          <Typography variant="h6">Поиск</Typography>
          <TextField label="Поиск по вопросам" variant="outlined" fullWidth sx={{ marginBottom: 2 }} />
          <Button variant="contained" color="primary" fullWidth>
            Искать
          </Button>
        </Box>

        {/* Основное содержимое */}
        <Box flex={1} marginLeft={3} bgcolor="#ffffff" borderRadius={2} boxShadow="0px 2px 5px rgba(0,0,0,0.1)" padding={2}>
          <Typography variant="h6">Вопросы поддержки</Typography>
          <List>
            <ListItem>Вопрос поддержки 1</ListItem>
            <ListItem>Вопрос поддержки 2</ListItem>
            <ListItem>Вопрос поддержки 3</ListItem>
            <ListItem>Вопрос поддержки 4</ListItem>
          </List>
        </Box>
      </Box>
    </Box>
  );
};

export default SupportStatistics;

