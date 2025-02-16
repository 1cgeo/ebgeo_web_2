// Path: mapSig\features\featureSearch\FeatureSearchControl\index.tsx
import SearchIcon from '@mui/icons-material/Search';
import { Tooltip } from '@mui/material';

import { type FC } from 'react';

import { FeatureSearchPanel } from '../FeatureSearchPanel';
import { SearchInput } from '../SearchInput';
import { useFeatureSearchStore } from '../store';
import { StyledIconButton } from './styles';

export const FeatureSearchControl: FC = () => {
  const { isInputVisible, isPanelOpen, toggleInput } = useFeatureSearchStore();

  return (
    <>
      <Tooltip title="Buscar por nomes geográficos" placement="left">
        <StyledIconButton onClick={toggleInput}>
          <SearchIcon />
        </StyledIconButton>
      </Tooltip>

      {isInputVisible && <SearchInput />}
      <FeatureSearchPanel open={isPanelOpen} />
    </>
  );
};
