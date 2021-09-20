/* eslint react/no-multi-comp: 0, react/prop-types: 0 */

import React, { useState } from 'react';
import { Alert, Button, Modal, ModalHeader, ModalBody, ModalFooter, Spinner } from 'reactstrap';
import { useSelector, useDispatch } from 'react-redux';
import { confirmDelete } from './confirmModalSlice';
import { useDeleteMovieMutation, useGetMoviesQuery } from './movieSlice';
import { initialState, setQueryParams, setSuccessMsg } from './movieSlice'

const ConfirmModal = () => {
  const { movie } = useSelector(state => state.confirmModal);

  const dispatch = useDispatch();

  const [deleteMovie, { isLoading, isSuccess, isError, error }] = useDeleteMovieMutation();

  const isDisabled = isLoading;

  const handleOnCancelClick = (e) => {
    dispatch(confirmDelete(null));
    setAlertMsg('');
  };

  const [alertMsg, setAlertMsg] = useState('');

  const handleOnDeleteClick = async (e) => {
    var result = await deleteMovie(movie);

    if (!result.error) {
      dispatch(setSuccessMsg(`Delete movie '${movie.title}' successfully.`));
      handleOnCancelClick();
      return;
    }

    if (result.error) {
      setAlertMsg(`${result.error.status} ${JSON.stringify(result.error.data)}`);
    }
  };

  if (!movie)
    return null;

  return (
    <div>
      <Modal isOpen={!!movie}>
        <ModalHeader>Modal title</ModalHeader>
        <ModalBody>
          <div className="form-group">
            Do you want to delete movie '{movie.title}'?
          </div>
          {alertMsg && <div className="form-group"><Alert color="danger">{alertMsg}</Alert></div>}
        </ModalBody>
        <ModalFooter>
          <Button color="danger" onClick={handleOnDeleteClick} disabled={isDisabled}>
            {isDisabled && <Spinner size="sm" color="light" />} Delete
          </Button>{' '}
          <Button color="secondary" onClick={handleOnCancelClick} disabled={isDisabled}>Cancel</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

export default ConfirmModal;