import React, { useState, useEffect } from 'react';
import { backend } from 'declarations/backend';
import { Container, Typography, TextField, Button, Slider, List, ListItem, ListItemText, LinearProgress, Box } from '@mui/material';
import { styled } from '@mui/system';

const StyledContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
}));

const StyledSlider = styled(Slider)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const App: React.FC = () => {
  const [billTotal, setBillTotal] = useState<number>(0);
  const [people, setPeople] = useState<{ id: number; name: string; percentage: number }[]>([]);
  const [newPersonName, setNewPersonName] = useState<string>('');
  const [totalPercentage, setTotalPercentage] = useState<number>(0);

  useEffect(() => {
    fetchBillSplit();
  }, []);

  const fetchBillSplit = async () => {
    const result = await backend.getBillSplit();
    if (result) {
      setBillTotal(Number(result.total));
      setPeople(result.people.map((p, index) => ({
        id: index,
        name: p.name,
        percentage: (Number(p.amount) / Number(result.total)) * 100,
      })));
      updateTotalPercentage();
    }
  };

  const updateTotalPercentage = () => {
    const total = people.reduce((sum, person) => sum + person.percentage, 0);
    setTotalPercentage(total);
  };

  const handleBillTotalChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTotal = parseFloat(event.target.value);
    setBillTotal(newTotal);
    backend.setBillTotal(newTotal);
  };

  const handleAddPerson = async () => {
    if (newPersonName.trim()) {
      const id = await backend.addPerson(newPersonName);
      setPeople([...people, { id: Number(id), name: newPersonName, percentage: 0 }]);
      setNewPersonName('');
      updateTotalPercentage();
    }
  };

  const handleRemovePerson = async (id: number) => {
    await backend.removePerson(id);
    setPeople(people.filter(p => p.id !== id));
    updateTotalPercentage();
  };

  const handlePercentageChange = async (id: number, newValue: number) => {
    await backend.updatePercentage(id, newValue);
    setPeople(people.map(p => p.id === id ? { ...p, percentage: newValue } : p));
    updateTotalPercentage();
  };

  return (
    <StyledContainer maxWidth="sm">
      <Typography variant="h4" component="h1" gutterBottom>
        Bill Splitter
      </Typography>
      <TextField
        label="Bill Total"
        type="number"
        value={billTotal}
        onChange={handleBillTotalChange}
        fullWidth
        margin="normal"
      />
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, mb: 2 }}>
        <TextField
          label="New Person"
          value={newPersonName}
          onChange={(e) => setNewPersonName(e.target.value)}
          fullWidth
          margin="normal"
        />
        <Button onClick={handleAddPerson} variant="contained" sx={{ ml: 2 }}>
          Add
        </Button>
      </Box>
      <List>
        {people.map((person) => (
          <ListItem key={person.id}>
            <ListItemText
              primary={person.name}
              secondary={`$${((person.percentage / 100) * billTotal).toFixed(2)}`}
            />
            <StyledSlider
              value={person.percentage}
              onChange={(_, newValue) => handlePercentageChange(person.id, newValue as number)}
              aria-labelledby="input-slider"
              valueLabelDisplay="auto"
              step={1}
              marks
              min={0}
              max={100}
            />
            <Button onClick={() => handleRemovePerson(person.id)} color="error">
              Remove
            </Button>
          </ListItem>
        ))}
      </List>
      <LinearProgress
        variant="determinate"
        value={totalPercentage}
        color={totalPercentage === 100 ? 'primary' : 'error'}
      />
      <Typography variant="body2" color={totalPercentage === 100 ? 'primary' : 'error'}>
        Total: {totalPercentage.toFixed(2)}%
      </Typography>
    </StyledContainer>
  );
};

export default App;
