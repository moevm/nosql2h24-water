import React, { useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");

  const handleSendEmail = () => {
    console.log("Код отправлен на email:", email);
    // Логика для отправки кода на email
  };

  const handleVerifyCode = () => {
    console.log("Введённый код:", code);
    // Логика для проверки кода
    navigate("/new-password"); // Перенаправление на страницу установки нового пароля
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
        Забыли Пароль
      </Typography>
      <Box width={300}>
        <TextField
          label="Введите вашу почту"
          type="email"
          variant="outlined"
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
        />
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={handleSendEmail}
          sx={{ marginTop: 2 }}
        >
          Отправить
        </Button>
        <TextField
          label="Введите код из почты"
          type="text"
          variant="outlined"
          margin="normal"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          fullWidth
        />
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={handleVerifyCode}
          sx={{ marginTop: 2 }}
        >
          Отправить
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

export default ForgotPassword;

