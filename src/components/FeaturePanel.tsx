import { Box, Typography, Button } from "@mui/material";
import { FeaturePanelProps } from "../ts/interfaces/mapSig.interfaces";

function FeaturePanel({
  title,
  onUpdate,
  onDelete,
  onClose,
  children,
  sx,
}: FeaturePanelProps) {
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
        ...sx,
      }}
    >
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {children}
      <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
        <Button variant="contained" onClick={onUpdate}>
          Salvar
        </Button>
        <Button variant="outlined" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="outlined" color="error" onClick={onDelete}>
          Excluir
        </Button>
      </Box>
    </Box>
  );
}

export default FeaturePanel;
