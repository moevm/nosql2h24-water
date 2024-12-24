import React from "react";
import { TextField, Button, Box, Typography } from "@mui/material";

const Register: React.FC = () => {
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
        Регистрация
      </Typography>
      <Box component="form" width={300} display="flex" flexDirection="column">
        <TextField
          label="Email"
          type="email"
          variant="outlined"
          margin="normal"
          required
        />
        <TextField
          label="Пароль"
          type="password"
          variant="outlined"
          margin="normal"
          required
        />
        <TextField
          label="Повторите пароль"
          type="password"
          variant="outlined"
          margin="normal"
          required
        />
        <Button
          variant="contained"
          color="primary"
          size="large"
          type="submit"
          sx={{ marginTop: 2 }}
        >
          Зарегистрироваться
        </Button>
      </Box>
    </Box>
  );
};

export default Register;

