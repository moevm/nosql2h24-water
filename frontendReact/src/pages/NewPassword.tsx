import React, { useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

const NewPassword: React.FC = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSave = () => {
    if (password !== confirmPassword) {
      alert("Пароли не совпадают!");
      return;
    }
    console.log("Пароль сохранён:", password);
    // Логика для сохранения нового пароля
    navigate("/settings"); // Перенаправление на страницу настроек
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100vh"
      bgcolor="#f5f5f5"
      padding={3}
    >
      <Typography variant="h4" gutterBottom>
        Новый Пароль
      </Typography>
      <Box width={300}>
        <TextField
          label="Введите новый пароль"
          type="password"
          variant="outlined"
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
        />
        <TextField
          label="Введите его ещё раз"
          type="password"
          variant="outlined"
          margin="normal"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          fullWidth
        />
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={handleSave}
          sx={{ marginTop: 2 }}
        >
          Сохранить
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => navigate(-1)} // Вернуться на предыдущую страницу
          sx={{ marginTop: 2 }}
        >
          Назад
        </Button>
      </Box>
    </Box>
  );
};

export default NewPassword;

