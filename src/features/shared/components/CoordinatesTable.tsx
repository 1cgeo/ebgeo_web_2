// Path: features\shared\components\CoordinatesTable.tsx

import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  IconButton,
  Button,
  Box,
  Chip,
  Tooltip,
  Switch,
  FormControlLabel,
  Alert,
  Divider,
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  GetApp as ExportIcon,
  Place as LocationIcon,
  Straighten as RulerIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
} from '@mui/icons-material';

import { ExtendedFeature } from '../../data-access/schemas/feature.schema';
import {
  formatCoordinates,
  formatDistance,
  formatArea,
  CoordinateFormat,
} from '../../../utils/format.utils';
import { geoUtils } from '../../../utils/turf.utils';
import { Position } from 'geojson';

interface CoordinatesTableProps {
  feature: ExtendedFeature;
  onVertexSelect?: (vertexIndex: number, coordinate: Position) => void;
  onVertexHover?: (vertexIndex: number | null) => void;
  selectedVertexIndex?: number;
  className?: string;
  maxHeight?: number;
  showActions?: boolean;
  showDistances?: boolean;
  compactMode?: boolean;
}

interface VertexInfo {
  index: number;
  coordinate: Position;
  latitude: number;
  longitude: number;
  distanceFromPrevious?: number;
  cumulativeDistance?: number;
}

export const CoordinatesTable: React.FC<CoordinatesTableProps> = ({
  feature,
  onVertexSelect,
  onVertexHover,
  selectedVertexIndex,
  className,
  maxHeight = 400,
  showActions = true,
  showDistances = true,
  compactMode = false,
}) => {
  const [coordinateFormat, setCoordinateFormat] = useState<CoordinateFormat>('decimal');
  const [precision, setPrecision] = useState(6);

  // Extrair coordenadas baseado no tipo de geometria
  const vertexData = useMemo((): VertexInfo[] => {
    const vertices: VertexInfo[] = [];
    let coordinates: Position[] = [];

    switch (feature.geometry.type) {
      case 'Point':
        coordinates = [feature.geometry.coordinates as Position];
        break;
      case 'LineString':
        coordinates = feature.geometry.coordinates as Position[];
        break;
      case 'Polygon':
        // Para polígonos, usar o anel exterior (primeiro array)
        // Remover o último ponto que é igual ao primeiro (fechamento)
        const ring = feature.geometry.coordinates[0] as Position[];
        coordinates = ring.slice(0, -1);
        break;
      default:
        return [];
    }

    let cumulativeDistance = 0;

    coordinates.forEach((coord, index) => {
      const [lng, lat] = coord;
      let distanceFromPrevious: number | undefined;

      // Calcular distância do ponto anterior (exceto para o primeiro)
      if (index > 0 && showDistances) {
        const prevCoord = coordinates[index - 1];
        distanceFromPrevious = geoUtils.measurements.distance(prevCoord, coord, 'meters');
        cumulativeDistance += distanceFromPrevious;
      }

      vertices.push({
        index,
        coordinate: coord,
        latitude: lat,
        longitude: lng,
        distanceFromPrevious,
        cumulativeDistance: index > 0 ? cumulativeDistance : undefined,
      });
    });

    return vertices;
  }, [feature.geometry, showDistances]);

  // Estatísticas da geometria
  const geometryStats = useMemo(() => {
    const totalVertices = vertexData.length;
    const totalDistance = vertexData[vertexData.length - 1]?.cumulativeDistance || 0;

    let area = 0;
    if (feature.geometry.type === 'Polygon') {
      try {
        area = geoUtils.measurements.area(feature.geometry, 'sqmeters');
      } catch (error) {
        console.warn('Erro ao calcular área:', error);
      }
    }

    return {
      totalVertices,
      totalDistance,
      area,
      geometryType: feature.geometry.type,
    };
  }, [vertexData, feature.geometry]);

  // Formatação de coordenadas
  const formatCoordinate = (coordinate: Position) => {
    const [lng, lat] = coordinate;

    switch (coordinateFormat) {
      case 'dms':
        return formatCoordinates.dms(lng, lat);
      case 'decimal':
      default:
        return formatCoordinates.decimal(lng, lat, precision);
    }
  };

  // Copiar coordenada para clipboard
  const copyCoordinate = async (
    coordinate: Position,
    format: 'decimal' | 'dms' | 'array' = coordinateFormat
  ) => {
    try {
      let textToCopy: string;
      const [lng, lat] = coordinate;

      switch (format) {
        case 'dms':
          textToCopy = formatCoordinates.dms(lng, lat);
          break;
        case 'array':
          textToCopy = `[${lng}, ${lat}]`;
          break;
        case 'decimal':
        default:
          textToCopy = formatCoordinates.decimal(lng, lat, precision);
          break;
      }

      await navigator.clipboard.writeText(textToCopy);
    } catch (error) {
      console.error('Erro ao copiar coordenada:', error);
    }
  };

  // Copiar todas as coordenadas
  const copyAllCoordinates = async () => {
    try {
      const coordsText = vertexData
        .map(vertex => `${vertex.index + 1}: ${formatCoordinate(vertex.coordinate)}`)
        .join('\n');

      await navigator.clipboard.writeText(coordsText);
    } catch (error) {
      console.error('Erro ao copiar coordenadas:', error);
    }
  };

  // Exportar coordenadas como JSON
  const exportCoordinates = () => {
    const data = {
      featureId: feature.id,
      geometryType: feature.geometry.type,
      coordinates: vertexData.map(vertex => ({
        index: vertex.index,
        latitude: vertex.latitude,
        longitude: vertex.longitude,
        distanceFromPrevious: vertex.distanceFromPrevious,
        cumulativeDistance: vertex.cumulativeDistance,
      })),
      stats: geometryStats,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `coordinates_${feature.properties.name || feature.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handlers de interação
  const handleVertexClick = (vertex: VertexInfo) => {
    onVertexSelect?.(vertex.index, vertex.coordinate);
  };

  const handleVertexHover = (vertex: VertexInfo | null) => {
    onVertexHover?.(vertex?.index ?? null);
  };

  if (vertexData.length === 0) {
    return (
      <Alert severity="info" sx={{ margin: 2 }}>
        Nenhuma coordenada disponível para esta feição.
      </Alert>
    );
  }

  return (
    <Box className={className}>
      {/* Cabeçalho com estatísticas */}
      <Box sx={{ p: compactMode ? 1 : 2, pb: 1 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
          <Typography variant={compactMode ? 'body2' : 'subtitle1'} fontWeight="medium">
            Vértices da Geometria
          </Typography>
          <Chip
            icon={<LocationIcon fontSize="small" />}
            label={geometryStats.geometryType}
            size="small"
            variant="outlined"
          />
        </Box>

        {/* Estatísticas */}
        <Box
          display="flex"
          flexDirection={compactMode ? 'column' : 'row'}
          gap={compactMode ? 0.5 : 2}
          mb={2}
        >
          <Typography variant="caption" color="textSecondary">
            <strong>{geometryStats.totalVertices}</strong> vértice
            {geometryStats.totalVertices !== 1 ? 's' : ''}
          </Typography>

          {showDistances && geometryStats.totalDistance > 0 && (
            <Typography variant="caption" color="textSecondary">
              <RulerIcon fontSize="inherit" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
              <strong>{formatDistance.auto(geometryStats.totalDistance)}</strong>
            </Typography>
          )}

          {geometryStats.area > 0 && (
            <Typography variant="caption" color="textSecondary">
              <strong>{formatArea.auto(geometryStats.area)}</strong>
            </Typography>
          )}
        </Box>

        {/* Controles */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          flexWrap="wrap"
          gap={1}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={coordinateFormat === 'dms'}
                  onChange={e => setCoordinateFormat(e.target.checked ? 'dms' : 'decimal')}
                />
              }
              label={
                <Typography variant="caption">
                  {coordinateFormat === 'dms' ? 'DMS' : 'Decimal'}
                </Typography>
              }
            />
          </Box>

          {showActions && (
            <Box display="flex" gap={0.5}>
              <Tooltip title="Copiar todas as coordenadas">
                <IconButton size="small" onClick={copyAllCoordinates}>
                  <CopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Exportar coordenadas">
                <IconButton size="small" onClick={exportCoordinates}>
                  <ExportIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Box>
      </Box>

      <Divider />

      {/* Tabela de coordenadas */}
      <TableContainer sx={{ maxHeight }}>
        <Table size={compactMode ? 'small' : 'medium'} stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell width="60px" align="center">
                <Typography variant="caption" fontWeight="medium">
                  #
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="caption" fontWeight="medium">
                  Coordenadas
                </Typography>
              </TableCell>
              {showDistances && (
                <>
                  <TableCell width="100px" align="right">
                    <Typography variant="caption" fontWeight="medium">
                      Distância
                    </Typography>
                  </TableCell>
                  <TableCell width="100px" align="right">
                    <Typography variant="caption" fontWeight="medium">
                      Acumulada
                    </Typography>
                  </TableCell>
                </>
              )}
              {showActions && (
                <TableCell width="60px" align="center">
                  <Typography variant="caption" fontWeight="medium">
                    Ações
                  </Typography>
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {vertexData.map(vertex => (
              <TableRow
                key={vertex.index}
                hover
                selected={selectedVertexIndex === vertex.index}
                onClick={() => handleVertexClick(vertex)}
                onMouseEnter={() => handleVertexHover(vertex)}
                onMouseLeave={() => handleVertexHover(null)}
                sx={{
                  cursor: onVertexSelect ? 'pointer' : 'default',
                  '&.Mui-selected': {
                    backgroundColor: 'primary.lighter',
                  },
                }}
              >
                <TableCell align="center">
                  <Typography variant={compactMode ? 'caption' : 'body2'} fontWeight="medium">
                    {vertex.index + 1}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography
                    variant={compactMode ? 'caption' : 'body2'}
                    fontFamily="monospace"
                    sx={{ wordBreak: 'break-all' }}
                  >
                    {formatCoordinate(vertex.coordinate)}
                  </Typography>
                </TableCell>

                {showDistances && (
                  <>
                    <TableCell align="right">
                      {vertex.distanceFromPrevious ? (
                        <Typography variant="caption" color="textSecondary">
                          {formatDistance.auto(vertex.distanceFromPrevious)}
                        </Typography>
                      ) : (
                        <Typography variant="caption" color="textSecondary">
                          -
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell align="right">
                      {vertex.cumulativeDistance ? (
                        <Typography variant="caption" color="textSecondary">
                          {formatDistance.auto(vertex.cumulativeDistance)}
                        </Typography>
                      ) : (
                        <Typography variant="caption" color="textSecondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                  </>
                )}

                {showActions && (
                  <TableCell align="center">
                    <Tooltip title="Copiar coordenada">
                      <IconButton
                        size="small"
                        onClick={e => {
                          e.stopPropagation();
                          copyCoordinate(vertex.coordinate);
                        }}
                      >
                        <CopyIcon fontSize="inherit" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
