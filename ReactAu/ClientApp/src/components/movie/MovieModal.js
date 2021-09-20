/* eslint react/no-multi-comp: 0, react/prop-types: 0 */

import React, { useState } from 'react';
import { Alert, Button, FormFeedback, Label, Input, Modal, ModalHeader, ModalBody, ModalFooter, Spinner } from 'reactstrap';
import { useSelector, useDispatch } from 'react-redux';
import { update } from './movieModalSlice';
import { initialState, setQueryParams, useAddMovieMutation, useGetMoviesQuery, useUpdateMovieMutation } from './movieSlice';
import { are2ObjectsEqual } from '../../helpers';
import validator from 'validator';
import { setSuccessMsg } from './movieSlice'

const MovieModal = (props) => {
  const { movie } = useSelector(state => state.movieModal);

  const dispatch = useDispatch();

  const [updateMovie, { isLoading: isUpdating, isSuccess: isUpdateSuccess, isError: isUpdateError, error: updateError }] = useUpdateMovieMutation();

  const [addMovie, { isLoading: isAdding, isSuccess: isAddSuccess, isError: isAddError, error: addError }] = useAddMovieMutation();

  const equal = are2ObjectsEqual;

  const isDisabled = isAdding || isUpdating;

  const handleOnCancelClick = (e) => {
    dispatch(update(null));
    setAlertMsg('');
  };

  const [alertMsg, setAlertMsg] = useState('');

  const { originalMovie } = useGetMoviesQuery(props.queryParams, {
    selectFromResult: ({ data }) => ({ originalMovie: data && data.items && movie ? data.items.find(m => m.id === movie.id) : undefined })
  });

  const handleOnAddOrUpdateClick = async (e) => {
    // ADDING
    if (!movie.id) {
      var result = await addMovie(movie);

      if (result.data) {
        dispatch(setSuccessMsg(`Add movie '${movie.title}' successfully.`));
        handleOnCancelClick();
        dispatch(setQueryParams({ ...initialState.queryParams, searchString: '' }));
        return;
      }

      if (result.error) {
        setAlertMsg(`${result.error.status} ${JSON.stringify(result.error.data)}`);
      }
      return;
    }

    // UPDATING
    if (equal(originalMovie, movie)) {
      handleOnCancelClick();
      return;
    }

    var result = await updateMovie(movie);

    if (result.data) {
      handleOnCancelClick();
      dispatch(setSuccessMsg(`Update movie '${movie.title}' successfully.`));
      return;
    }

    if (result.error) {
      setAlertMsg(`${result.error.status} ${JSON.stringify(result.error.data)}`);
    }
  };

  const handleOnChange = (e, propName) => {
    var o = {};
    o[propName] = e.target.value;
    dispatch(update({ ...movie, ...o }));
  };

  if (!movie)
    return null;

  const titleInvalid = validator.isEmpty(movie.title);
  const releaseDateInvalid = !validator.isISO8601(movie.releaseDate, { strict: true, strictSeparator: true });
  const genreInvalid = validator.isEmpty(movie.genre);
  const priceInvalid = !validator.isCurrency(movie.price.toString());

  const anyInputInvalid = titleInvalid || releaseDateInvalid || genreInvalid || priceInvalid;

  return (
    <div>
      <Modal isOpen={!!movie}>
        <ModalHeader>Modal title</ModalHeader>
        <ModalBody>
          <div className="form-group">
            <Label for="title">Title</Label>
            <Input type="text" className="form-control" id="title" value={movie.title} onChange={e => handleOnChange(e, "title")} disabled={isDisabled} invalid={titleInvalid} />
            {titleInvalid && <FormFeedback>Title should not be empty.</FormFeedback>}
          </div>
          <div className="form-group">
            <Label for="releaseDate">Release Date</Label>
            <Input type="text" className="form-control" id="releaseDate" value={movie.releaseDate} onChange={e => handleOnChange(e, "releaseDate")} disabled={isDisabled} invalid={releaseDateInvalid} />
            {releaseDateInvalid && <FormFeedback>Release Date should be '1986-02-23T00:00:00'.</FormFeedback>}
          </div>
          <div className="form-group">
            <Label for="genre">Genre</Label>
            <Input type="text" className="form-control" id="genre" value={movie.genre} onChange={e => handleOnChange(e, "genre")} disabled={isDisabled} invalid={genreInvalid} />
            {genreInvalid && <FormFeedback>Genre should not be empty.</FormFeedback>}
          </div>
          <div className="form-group">
            <Label for="price">Price</Label>
            <Input type="text" className="form-control" id="price" value={movie.price} onChange={e => handleOnChange(e, "price")} disabled={isDisabled} invalid={priceInvalid} />
            {priceInvalid && <FormFeedback>Price should be '9.56'.</FormFeedback>}
          </div>
          {alertMsg && <div className="form-group"><Alert color="danger">{alertMsg}</Alert></div>}
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleOnAddOrUpdateClick} disabled={isDisabled || anyInputInvalid}>
            {isDisabled && <Spinner size="sm" color="light" />} {!movie.id ? 'Add' : 'Update'}
          </Button>{' '}
          <Button color="secondary" onClick={handleOnCancelClick} disabled={isDisabled}>Cancel</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

export default MovieModal;