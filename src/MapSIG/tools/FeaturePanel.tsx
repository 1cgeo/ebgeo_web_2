import { Box, Typography, Button } from "@mui/material";
import { FeaturePanelProps } from "../../ts/interfaces/mapSig.interfaces";

function FeaturePanel<T>({
  title,
  features,
  onUpdate,
  onDelete,
  onClose,
  children,
}: FeaturePanelProps<T>) {
  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 10,
        right: 10,
        width: 300,
        bgcolor: "background.paper",
        border: "1px solid grey",
        borderRadius: 1,
        p: 2,
        zIndex: 1002,
      }}
    >
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {children}
      <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
        <Button variant="contained" onClick={() => onUpdate(features)}>
          Salvar
        </Button>
        <Button variant="outlined" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          variant="outlined"
          color="error"
          onClick={() => onDelete(features)}
        >
          Excluir
        </Button>
      </Box>
    </Box>
  );
}

export default FeaturePanel;
