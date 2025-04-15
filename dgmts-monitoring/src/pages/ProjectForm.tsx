import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Instrument {
  description: string;
  location: string;
  id: string;
}

interface User {
  name: string;
  email: string;
}

const ProjectForm: React.FC = () => {
  const [projectName, setProjectName] = useState('');
  const [projectLocation, setProjectLocation] = useState('');
  const [client, setClient] = useState('');
  const [pocName, setPocName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [permissions, setPermissions] = useState({
    accessToSite: false,
    alarm: false,
    viewDataOnly: false,
    downloadDataOnly: false,
    viewGraphOnly: false,
  });

  const [newInstrument, setNewInstrument] = useState<Instrument>({ description: '', location: '', id: '' });
  const [newUser, setNewUser] = useState<User>({ name: '', email: '' });

  const handleAddInstrument = () => {
    if (!newInstrument.description || !newInstrument.location || !newInstrument.id) {
      toast.error('Please fill all instrument fields');
      return;
    }
    setInstruments([...instruments, newInstrument]);
    setNewInstrument({ description: '', location: '', id: '' });
  };

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email) {
      toast.error('Please fill all user fields');
      return;
    }
    setUsers([...users, newUser]);
    setNewUser({ name: '', email: '' });
  };

  const handleSubmit = () => {
    if (!projectName || !projectLocation || !client || !pocName || !phone || !email) {
      toast.error('Please fill in all project details');
      return;
    }

    const formData = {
      projectName,
      projectLocation,
      client,
      pocName,
      phone,
      email,
      instruments,
      users,
      permissions,
    };

    console.log('Form Data:', formData);
    toast.success('Project form submitted successfully');
  };

  return (
    <div className="form-container">
      <ToastContainer />
      <h2>Project Form</h2>

      <div className="form-section">
        <input
          className="input-field"
          type="text"
          placeholder="Project Name"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
        />
        <input
          className="input-field"
          type="text"
          placeholder="Project Location"
          value={projectLocation}
          onChange={(e) => setProjectLocation(e.target.value)}
        />
        <input
          className="input-field"
          type="text"
          placeholder="Client"
          value={client}
          onChange={(e) => setClient(e.target.value)}
        />
        <input
          className="input-field"
          type="text"
          placeholder="POC Name"
          value={pocName}
          onChange={(e) => setPocName(e.target.value)}
        />
        <input
          className="input-field"
          type="text"
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <input
          className="input-field"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="form-section">
        <h3>Add Instrument</h3>
        <input
          className="input-field"
          type="text"
          placeholder="Description"
          value={newInstrument.description}
          onChange={(e) => setNewInstrument({ ...newInstrument, description: e.target.value })}
        />
        <input
          className="input-field"
          type="text"
          placeholder="Location"
          value={newInstrument.location}
          onChange={(e) => setNewInstrument({ ...newInstrument, location: e.target.value })}
        />
        <input
          className="input-field"
          type="text"
          placeholder="ID"
          value={newInstrument.id}
          onChange={(e) => setNewInstrument({ ...newInstrument, id: e.target.value })}
        />
        <button className="submit-btn" onClick={handleAddInstrument}>Add Instrument</button>
      </div>

      <div className="form-section">
        <h3>Add User</h3>
        <input
          className="input-field"
          type="text"
          placeholder="Name"
          value={newUser.name}
          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
        />
        <input
          className="input-field"
          type="email"
          placeholder="Email"
          value={newUser.email}
          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
        />
        <button className="submit-btn" onClick={handleAddUser}>Add User</button>
      </div>

      <div className="form-section">
        <h3>Permissions</h3>
        <select
          className="input-field"
          onChange={(e) => setPermissions({ ...permissions, accessToSite: e.target.value === 'yes' })}
        >
          <option value="no">Select Permission</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
        <label>
          <input
            type="checkbox"
            checked={permissions.accessToSite}
            onChange={(e) => setPermissions({ ...permissions, accessToSite: e.target.checked })}
          />
          Access to Site
        </label>
        <label>
          <input
            type="checkbox"
            checked={permissions.alarm}
            onChange={(e) => setPermissions({ ...permissions, alarm: e.target.checked })}
          />
          Alarm
        </label>
        <label>
          <input
            type="checkbox"
            checked={permissions.viewDataOnly}
            onChange={(e) => setPermissions({ ...permissions, viewDataOnly: e.target.checked })}
          />
          View Data Only
        </label>
        <label>
          <input
            type="checkbox"
            checked={permissions.downloadDataOnly}
            onChange={(e) => setPermissions({ ...permissions, downloadDataOnly: e.target.checked })}
          />
          Download Data Only
        </label>
        <label>
          <input
            type="checkbox"
            checked={permissions.viewGraphOnly}
            onChange={(e) => setPermissions({ ...permissions, viewGraphOnly: e.target.checked })}
          />
          View Graph Only
        </label>
      </div>

      <button className="submit-btn" onClick={handleSubmit}>Submit Project</button>
    </div>
  );
};

export default ProjectForm;
