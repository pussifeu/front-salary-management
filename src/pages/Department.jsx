import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { DepartmentService } from '../services/DepartmentService';
import { MdAdd } from "react-icons/md";

const INITIAL_DEPARTMENT = {
  name: '',
  code: '',
};

const Department = () => {
  const [departments, setDepartments] = useState([]);
  const [newDepartment, setNewDepartment] = useState(INITIAL_DEPARTMENT);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  const fetchDepartments = async () => {
    try {
      const response = await DepartmentService.getAllDepartments();
      setDepartments(response.data.data || []);
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.message || 'Erreur lors du chargement des départements';
      toast.error(message);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleInputChange = (e, isEditing = false) => {
    const { name, value } = e.target;
    let updatedValue = value;

    if (name === 'name') {
      // Remove any numbers from the input
      updatedValue = value.replace(/[0-9]/g, '');
    }

    const updatedDepartment = isEditing ? { ...editingDepartment, [name]: updatedValue } : { ...newDepartment, [name]: updatedValue };

    if (isEditing) {
      setEditingDepartment(updatedDepartment);
    } else {
      setNewDepartment(updatedDepartment);
    }
  };


  const validateForm = (department) => {
    let isValid = true;
    const newErrors = {};

    if (!department.name.trim()) {
      newErrors.name = 'Le nom du départment est obligatoire.';
      isValid = false;
    }
    if (department.name.match(/\d/)) {
      newErrors.name = 'Le nom du département ne doit pas contenir de chiffres.';
      isValid = false;
    }
    if (!department.code.trim()) {
      newErrors.code = 'Le code du département est obligatoire.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const resetForm = () => {
    setNewDepartment(INITIAL_DEPARTMENT);
    setEditingDepartment(null);
    setErrors({});
  };

  const addDepartment = async () => {
    if (!validateForm(newDepartment)) {
      return;
    }

    setLoading(true);

    try {
      const response = await DepartmentService.createDepartment(newDepartment);
      toast.success(response.data.message);
      resetForm();
      await fetchDepartments();
      document.getElementById('closeAddModal')?.click();
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.message || 'Erreur lors de l\'ajout du département';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const updateDepartment = async () => {
    if (!editingDepartment?.id) return;
    if (!validateForm(editingDepartment)) {
      return;
    }

    setLoading(true);

    try {
      const response = await DepartmentService.updateDepartment(editingDepartment.id, editingDepartment);
      toast.success(response.data.message);
      resetForm();
      await fetchDepartments();
      document.getElementById('closeEditModal')?.click();
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.message || 'Erreur lors de la mise à jour du département';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const deleteDepartment = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce département ?')) {
      setLoading(true);

      try {
        const response = await DepartmentService.deleteDepartment(id);
        toast.success(response.data.message); // Afficher le message de succès
        await fetchDepartments();
      } catch (error) {
        console.error(error);
        const message = error.response?.data?.message || 'Erreur lors de la suppression du département';
        toast.error(message); // Afficher le message d'erreur spécifique du backend
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEditClick = (department) => {
    setEditingDepartment({ ...department });
    setErrors({});
  };

  const filteredDepartments = departments.filter(department => {
    const searchLower = searchTerm.toLowerCase();
    return (
      department.name.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="pc-container">
      <div className="pc-content">
        {/* [ breadcrumb ] start */}
        <div className="page-header">
          <div className="page-block">
            <div className="row align-items-center">
              <div className="col-md-12">
                <div className="page-header-title">
                  <h5 className="m-b-10">Gérer les départements</h5>
                </div>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">Pages</li>
                  <li className="breadcrumb-item">Départements</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        {/* [ breadcrumb ] end */}

        {/* [ Main Content ] start */}
        <div className="row">
          <div className="col-12">
            <div className="card mb-4">
              <div className="card-header">
                <div className="d-flex justify-content-between align-items-center">
                  <h6>Liste des Départements ({filteredDepartments.length}/{departments.length})</h6>
                  <button className="btn btn-primary d-flex align-items-center"
                    data-bs-toggle="modal"
                    data-bs-target="#addModal">
                    <MdAdd className="me-2" /> Ajouter un Département
                  </button>
                </div>
                <div className="input-group" style={{ width: '300px' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Rechercher par nom du départment..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button className="btn btn-outline-secondary" type="button">
                    <i className="ti ti-search"></i>
                  </button>
                </div>
              </div>
              <div className="card-body">
                <div className="dt-responsive table-responsive">
                  <table className="table table-striped table-bordered nowrap">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Nom du Département</th>
                        <th>Code du Département</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDepartments.length === 0 ? (
                        <tr>
                          <td colSpan="6">
                            {departments.length === 0
                              ? "Aucun département trouvé"
                              : "Aucun département ne correspond à votre recherche"}
                          </td>
                        </tr>
                      ) : (
                        filteredDepartments.map(dept => (
                          <tr key={dept.id}>
                            <td>{dept.id}</td>
                            <td>{dept.name}</td>
                            <td>{dept.code}</td>
                            <td className="text-center">
                              <ul className="me-auto mb-0" style={{ display: 'flex', flexDirection: 'row', paddingLeft: 0, listStyle: 'none', marginLeft: '-5px' }}>
                                <li className="align-bottom" style={{ marginRight: '10px' }}>
                                  <a className="avtar avtar-xs btn-link-primary"
                                    data-bs-toggle="modal"
                                    data-bs-target="#editModal"
                                    onClick={() => handleEditClick(dept)}
                                    style={{ cursor: 'pointer' }}>
                                    <i className="ti ti-edit-circle f-18"></i>
                                  </a>
                                </li>
                                <li className="align-bottom">
                                  <a className="avtar avtar-xs btn-link-danger"
                                    onClick={() => deleteDepartment(dept.id)}
                                    style={{ cursor: 'pointer' }}>
                                    <i className="ti ti-trash f-18" style={{ color: 'red' }}></i>
                                  </a>
                                </li>
                              </ul>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal d'ajout */}
      <div className="modal fade" id="addModal" tabIndex="-1" aria-labelledby="addModalLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="addModalLabel">Ajouter un département</h5>
              <button type="button" className="btn-close" id="closeAddModal" data-bs-dismiss="modal" aria-label="Close" onClick={resetForm}></button>
            </div>
            <div className="modal-body">
              {renderDepartmentForm(newDepartment, handleInputChange, false, errors)}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
              <button type="button" className="btn btn-primary" onClick={addDepartment} disabled={loading}>
                {loading ? 'Ajout en cours...' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de modification */}
      <div className="modal fade" id="editModal" tabIndex="-1" aria-labelledby="editModalLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="editModalLabel">Modifier un département</h5>
              <button type="button" className="btn-close" id="closeEditModal" data-bs-dismiss="modal" aria-label="Close" onClick={resetForm}></button>
            </div>
            <div className="modal-body">
              {editingDepartment && renderDepartmentForm(editingDepartment, handleInputChange, true, errors)}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
              <button type="button" className="btn btn-primary" onClick={updateDepartment} disabled={loading}>
                {loading ? 'Mise à jour...' : 'Mettre à jour'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const renderDepartmentForm = (department, handleChange, isEditing = false, errors) => (
  <form>
    <div className={`form-floating mb-3 ${errors.name ? 'is-invalid' : ''}`}>
      <input
        type="text"
        className={`form-control ${errors.name ? 'is-invalid' : ''}`}
        name="name"
        placeholder="Nom du département"
        value={department.name}
        onChange={(e) => handleChange(e, isEditing)}
      />
      <label htmlFor="floatingName">Nom du département</label>
      {errors.name && <div className="invalid-feedback">{errors.name}</div>}
    </div>

    <div className={`form-floating mb-3 ${errors.code ? 'is-invalid' : ''}`}>
      <input
        type="text"
        className={`form-control ${errors.code ? 'is-invalid' : ''}`}
        name="code"
        placeholder="Code du département"
        value={department.code}
        onChange={(e) => handleChange(e, isEditing)}
      />
      <label className="floatingCode">Code du département</label>
      {errors.code && <div className="invalid-feedback">{errors.code}</div>}
    </div>
  </form>
);

export default Department;