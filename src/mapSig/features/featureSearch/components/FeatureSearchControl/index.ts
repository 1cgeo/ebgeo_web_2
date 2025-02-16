import { type FC } from 'react';
import { Tooltip } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useFeatureSearchStore } from '../../store';
import { StyledIconButton } from './styles';
import { FeatureSearchPanel } from '../FeatureSearchPanel';

export const FeatureSearchControl: FC = () => {
  const { isPanelOpen, openPanel, closePanel } = useFeatureSearchStore();

  return (
    <>
      <Tooltip title="Buscar feições" placement="left">
        <StyledIconButton 
          onClick={openPanel}
          $active={isPanelOpen}
        >
          <SearchIcon />
        </StyledIconButton>
      </Tooltip>
      
      <FeatureSearchPanel 
        open={isPanelOpen} 
        onClose={closePanel}
      />
    </>
  );
};