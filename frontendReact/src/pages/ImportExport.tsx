import React, { useState } from "react";
import { Box, Button, Typography, Input } from "@mui/material";

const ImportExport: React.FC = () => {
  const [importedData, setImportedData] = useState<string | null>(null);

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImportedData(reader.result as string);
        console.log("Imported Data:", reader.result);
      };
      reader.readAsText(file);
    }
  };

  const handleExport = () => {
    const data = "Пример экспортированных данных"; // Здесь можно подставить реальные данные
    const blob = new Blob([data], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "exported_routes.txt";
    a.click();
    window.URL.revokeObjectURL(url);
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
        Импорт/Экспорт маршрутов
      </Typography>
      <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
        <Button variant="contained" component="label" color="primary">
          Импортировать
          <Input
            type="file"
            hidden
            onChange={handleImport}
            inputProps={{ accept: ".txt,.json" }}
          />
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleExport}
        >
          Экспортировать
        </Button>
      </Box>
      {importedData && (
        <Box
          marginTop={4}
          padding={2}
          bgcolor="#e0e0e0"
          width="80%"
          borderRadius={2}
        >
          <Typography variant="h6">Импортированные данные:</Typography>
          <Typography>{importedData}</Typography>
        </Box>
      )}
    </Box>
  );
};

export default ImportExport;

