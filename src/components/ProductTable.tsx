import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputNumber } from 'primereact/inputnumber';

interface Artwork {
  id: number;
  title: string;
  artist_display: string;
}

const ArtworkTable: React.FC = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(6);
  const [selectedArtworks, setSelectedArtworks] = useState<Artwork[]>([]);
  const [showSelectionDialog, setShowSelectionDialog] = useState(false);
  const [rowsToSelect, setRowsToSelect] = useState<number | null>(null);
  const [selectingMode, setSelectingMode] = useState(false);

  const fetchArtworks = async (page: number) => {
    try {
      const response = await fetch(`https://api.artic.edu/api/v1/artworks?page=${page}&limit=${rows}`);
      const data = await response.json();
      setArtworks(data.data);
      setTotalRecords(data.pagination.total);
    } catch (error) {
      console.error('Error fetching artworks:', error);
    }
  };

  useEffect(() => {
    fetchArtworks(1);
  }, [rows]);

  const onPageChange = (event: { first: number; rows: number }) => {
    setFirst(event.first);
    setRows(event.rows);
    fetchArtworks(Math.floor(event.first / event.rows) + 1);
  };

  const openSelectionDialog = () => {
    setSelectingMode(true);
    setShowSelectionDialog(true);
  };

  const closeSelectionDialog = () => {
    setShowSelectionDialog(false);
    setRowsToSelect(null);
    setSelectingMode(false);
  };

  const submitRowSelection = () => {
    if (rowsToSelect !== null && rowsToSelect > 0) {
      const newSelection = artworks.slice(0, Math.min(rowsToSelect, artworks.length));
      setSelectedArtworks(newSelection);
    }
    closeSelectionDialog();
  };

  const onHeaderCheckboxChange = () => {
    if (selectingMode) {
      closeSelectionDialog();
    } else {
      openSelectionDialog();
    }
  };

  const checkboxBody = (rowData: Artwork) => {
    return (
      <input
        type="checkbox"
        checked={selectedArtworks.some((artwork) => artwork.id === rowData.id)}
        onChange={() => {
          if (selectedArtworks.some((artwork) => artwork.id === rowData.id)) {
            setSelectedArtworks(selectedArtworks.filter((artwork) => artwork.id !== rowData.id));
          } else {
            const selectedCount = selectedArtworks.length;
            const maxSelection = rowsToSelect ?? Number.MAX_VALUE;
            if (selectedCount < maxSelection) {
              setSelectedArtworks([...selectedArtworks, rowData]);
            }
          }
        }}
      />
    );
  };

  const headerCheckbox = () => (
    <input
      type="checkbox"
      checked={selectingMode}
      onChange={onHeaderCheckboxChange}
    />
  );

  return (
    <div>
      <DataTable
        value={artworks}
        selection={selectedArtworks}
        onSelectionChange={(e) => setSelectedArtworks(e.value)}
        dataKey="id"
        paginator
        rows={rows}
        totalRecords={totalRecords}
        lazy
        first={first}
        onPage={onPageChange}
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
        rowsPerPageOptions={[6, 12, 18]}
      >
        <Column
          header={headerCheckbox()}
          headerStyle={{ width: '3rem' }}
          body={checkboxBody}
        ></Column>
        <Column field="id" header="ID"></Column>
        <Column field="title" header="Title"></Column>
        <Column field="artist_display" header="Artist"></Column>
      </DataTable>

      <Dialog 
        header="Select Rows" 
        visible={showSelectionDialog} 
        onHide={closeSelectionDialog}
        footer={(
          <div>
            <Button label="Cancel" icon="pi pi-times" onClick={closeSelectionDialog} className="p-button-text" />
            <Button label="Submit" icon="pi pi-check" onClick={submitRowSelection} autoFocus />
          </div>
        )}
      >
        <div className="p-fluid">
          <div className="p-field">
            <label htmlFor="rowsToSelect">Number of rows to select:</label>
            <InputNumber 
              id="rowsToSelect" 
              value={rowsToSelect} 
              onValueChange={(e) => setRowsToSelect(e.value)} 
              min={0} 
              max={artworks.length}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default ArtworkTable;
