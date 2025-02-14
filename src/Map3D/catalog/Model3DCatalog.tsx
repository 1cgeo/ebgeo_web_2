import React, {
  useState,
  useEffect,
  useCallback,
  Suspense,
  useMemo,
  useRef,
} from "react";
import {
  Modal,
  Box,
  TextField,
  Typography,
  CircularProgress,
  InputAdornment,
  useTheme,
  useMediaQuery,
  Fade,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import SearchIcon from "@mui/icons-material/Search";
import config from "../../config";
import { CatalogItem } from "../../ts/types/map3D.types";
import { useMapTools } from "../contexts/Map3DTools";
import InfiniteScroll from "react-infinite-scroll-component";

const ModelCard = React.lazy(() => import("./ModelCard"));

interface Model3DCatalogProps {
  open: boolean;
  onClose: () => void;
}

const Model3DCatalog: React.FC<Model3DCatalogProps> = ({ open, onClose }) => {
  const { addModel, models: loadedModels } = useMapTools();
  const [models, setModels] = useState<CatalogItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [resizeLoading, setResizeLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const searchTimeout = useRef<number | null>(null);
  const theme = useTheme();
  const prevColumnsCountRef = useRef<number>();

  // Determina o número de colunas baseado no breakpoint
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const isSm = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const isMd = useMediaQuery(theme.breakpoints.between("md", "lg"));

  const columnsCount = useMemo(() => {
    if (isXs) return 1;
    if (isSm) return 2;
    if (isMd) return 3;
    return 4;
  }, [isXs, isSm, isMd]);

  // Ajusta o número de registros por página para ser múltiplo do número de colunas
  const recordsPerPage = columnsCount * 3; // 3 linhas por vez

  const handleAddModelAndClose = (model: any) => {
    addModel(model);
    onClose();
  };

  const fetchModels = async (search: string = "", pageNum: number = 1, isResize: boolean = false) => {
    if (!hasMore && pageNum > 1 && !isResize) return;
    
    if (isResize) {
      setResizeLoading(true);
    } else {
      setLoading(true);
    }
    
    setNoResults(false);
    
    try {
      const searchParam = search ? `&q=${encodeURIComponent(search)}` : "";
      const response = await fetch(
        `${config.endpoints.modelCatalog}?nr_records=${recordsPerPage}&page=${pageNum}${searchParam}`
      );
      if (!response.ok) {
        throw new Error("Error in server response");
      }
      const data = await response.json();

      // Se é uma página nova, adiciona aos modelos existentes
      // Se é um resize ou primeira página, substitui completamente
      if (pageNum === 1 || isResize) {
        setModels(data.data);
        setNoResults(data.data.length === 0);
      } else {
        setModels(prevModels => [...prevModels, ...data.data]);
      }

      setTotalCount(data.total);
      
      // Calcula hasMore baseado nos novos dados
      const currentTotal = pageNum === 1 ? data.data.length : models.length + data.data.length;
      setHasMore(currentTotal < data.total);
      
    } catch (error) {
      console.error("Error fetching models:", error);
      setNoResults(true);
      setHasMore(false);
    } finally {
      setLoading(false);
      setResizeLoading(false);
    }
  };

  const debouncedSearch = useCallback((search: string) => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    searchTimeout.current = window.setTimeout(() => {
      setPage(1);
      setHasMore(true);
      fetchModels(search, 1);
    }, 300);
  }, []);

  // Effect para detectar mudanças no número de colunas
  useEffect(() => {
    if (prevColumnsCountRef.current !== undefined && prevColumnsCountRef.current !== columnsCount && open) {
      console.log('Columns changed from', prevColumnsCountRef.current, 'to', columnsCount);
      setPage(1);
      setHasMore(true);
      fetchModels(searchTerm, 1, true);
    }
    prevColumnsCountRef.current = columnsCount;
  }, [columnsCount, open]);

  useEffect(() => {
    if (open) {
      setPage(1);
      setHasMore(true);
      fetchModels();
    }
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [open]);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      debouncedSearch(searchTerm);
    } else if (searchTerm.length === 0) {
      setPage(1);
      setHasMore(true);
      fetchModels();
    }
  }, [searchTerm]);

  const handleLoadMore = useCallback(() => {
    if (!hasMore || loading || resizeLoading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchModels(searchTerm, nextPage);
  }, [page, searchTerm, hasMore, loading, resizeLoading]);

  const isModelLoaded = useMemo(
    () => (model: CatalogItem) => {
      return loadedModels.some((loadedModel) => loadedModel.id === model.id);
    },
    [loadedModels]
  );

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        id="catalogContainer"
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "90%",
          maxWidth: 1200,
          maxHeight: "90vh",
          bgcolor: "rgba(255, 255, 255, 0.9)",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography
          variant="h4"
          component="h2"
          gutterBottom
          sx={{ mb: 3, color: "#315730" }}
        >
          Catálogo de modelos 3D
        </Typography>
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Buscar modelos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "text.secondary" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "50px",
                "& fieldset": {
                  borderColor: "rgba(0, 0, 0, 0.23)",
                },
                "&:hover fieldset": {
                  borderColor: "rgba(0, 0, 0, 0.23)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#315730",
                },
              },
            }}
          />
        </Box>

        {!noResults && models.length > 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Mostrando {models.length} de {totalCount} resultados
          </Typography>
        )}

        <Box
          id="scrollableDiv"
          sx={{
            overflow: "auto",
            flex: 1,
            maxHeight: "calc(90vh - 200px)",
          }}
        >
          <Fade in={resizeLoading}>
            <Box 
              sx={{ 
                position: 'absolute', 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)',
                zIndex: 1000,
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                padding: 2,
                borderRadius: 2
              }}
            >
              <CircularProgress />
            </Box>
          </Fade>

          {noResults ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                Nenhum resultado encontrado para sua busca.
              </Typography>
              <Typography variant="body1" color="text.secondary" mt={2}>
                Tente ajustar seus termos de busca ou explorar outros modelos.
              </Typography>
            </Box>
          ) : (
            <InfiniteScroll
              dataLength={models.length}
              next={handleLoadMore}
              hasMore={hasMore}
              loader={
                <Box sx={{ textAlign: "center", py: 2 }}>
                  <CircularProgress />
                </Box>
              }
              endMessage={
                models.length > 0 && (
                  <Box sx={{ textAlign: "center", py: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Você já viu todos os modelos disponíveis!
                    </Typography>
                  </Box>
                )
              }
              scrollableTarget="scrollableDiv"
            >
              <Grid container spacing={2}>
                <Suspense fallback={<CircularProgress />}>
                  {models.map((model) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={model.id}>
                      <ModelCard
                        model={model}
                        onAddModel={handleAddModelAndClose}
                        isLoaded={isModelLoaded(model)}
                      />
                    </Grid>
                  ))}
                </Suspense>
              </Grid>
            </InfiniteScroll>
          )}
        </Box>
      </Box>
    </Modal>
  );
};

export default Model3DCatalog;