import React from 'react';
// import Navbar from '../components/Navbar';
import HeaNavLogo from "../components/HeaNavLogo";
import { useNavigate } from 'react-router-dom';
import projectsData from '../data/projectsData.json';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
} from '@mui/material';

const Projects: React.FC = () => {
  const navigate = useNavigate();

  const handleShowData = (project: any) => {
    navigate('/instruments', { state: { project } });
  };

  return (
    <div>
      <HeaNavLogo />
      <h2 style={{ textAlign: 'center', marginTop: '20px' }}>Project List</h2>
      
      {/* Centering the table */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <TableContainer component={Paper} style={{ maxWidth: '90%' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Project Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>Show Data</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projectsData.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>{project.name}</TableCell>
                  <TableCell>{project.status}</TableCell>
                  <TableCell>{project.startDate}</TableCell>
                  <TableCell>
                    <Button variant="outlined" onClick={() => handleShowData(project)}>
                      Show Data
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
};

export default Projects;
