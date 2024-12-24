import React from "react";
import { Box, Button, Typography, List, ListItem } from "@mui/material";
import { useNavigate } from "react-router-dom";

const MainMenu: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100vh"
      bgcolor="#f5f5f5"
    >
      <Typography variant="h4" gutterBottom>
        Главное меню
      </Typography>
      <List>
        <ListItem>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={() => navigate("/profile")}
          >
            Профиль
          </Button>
        </ListItem>
        <ListItem>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={() => navigate("/map")}
          >
            Карта
          </Button>
        </ListItem>
        <ListItem>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={() => navigate("/statistics")}
          >
            Статистика
          </Button>
        </ListItem>
        <ListItem>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={() => navigate("/settings")}
          >
            Настройки
          </Button>
        </ListItem>
        <ListItem>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={() => navigate("/support")}
          >
            Поддержка
          </Button>
        </ListItem>
      </List>
    </Box>
  );
};

export default MainMenu;

