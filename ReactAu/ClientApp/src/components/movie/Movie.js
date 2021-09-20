import React, { useState } from 'react';
import { Button, Form, FormGroup, Input, Spinner, Table, UncontrolledAlert } from 'reactstrap';
import { useSelector, useDispatch } from 'react-redux'
import { initialState, setQueryParams, useGetMoviesQuery } from './movieSlice'
import MovieModal from './MovieModal'
import ConfirmModal from './ConfirmModal'
import { getEmptyMovie, update } from './movieModalSlice'
import { confirmDelete } from './confirmModalSlice'
import { useDebounce, useDebouncedCallback  } from 'use-debounce';
import ReactPaginate from 'react-paginate';

export function Movie() {
  const queryParams = useSelector(state => state.movie.queryParams);
  const { searchString, pageIndex, sortOrder } = queryParams;
  const { successMsg } = useSelector(state => state.movie);
  const dispatch = useDispatch();

  const { data, isLoading, isFetching, isSuccess, isError, error } = useGetMoviesQuery(queryParams);

  const emptyMovie = useSelector(getEmptyMovie);

  const debounced = useDebouncedCallback((value) => {
    dispatch(setQueryParams({ ...initialState.queryParams, searchString: value }));
  }, 1000);

  const disabled = isLoading || isFetching;

  const tbody = disabled ?
    (<tr><td colSpan="100" className="text-center"><Spinner size="sm" color="primary" />{' '}<strong>Loading...</strong></td></tr>) :
    data && data.items && data.items.length ?
      (
        data.items.map(movie =>
          <tr key={movie.id}>
            <td>{movie.title}</td>
            <td>{movie.releaseDate}</td>
            <td>{movie.genre}</td>
            <td>{movie.price}</td>
            <td><Button color="info" size="sm" onClick={e => dispatch(update(movie))}>Update</Button> <Button color="danger" size="sm" onClick={e => dispatch(confirmDelete(movie))}>Delete</Button></td>
          </tr>
        )
      ) :
      (<tr><td colSpan="100" className="text-center">Found nothing...</td></tr>);

  const handleOnPageChange = data => {
    dispatch(setQueryParams({ ...queryParams, pageIndex: data.selected + 1 }));
  };

  const pager = data ?
    (
      <ReactPaginate
        onPageChange={handleOnPageChange}
        activeClassName={'active'}
        breakClassName={'break-me'}
        breakLabel={'...'}
        containerClassName={'pagination'}
        disabledClassName={'disabled'}
        forcePage={pageIndex - 1}
        hrefBuilder={e => '#'}
        marginPagesDisplayed={2}
        nextLabel={'next'}
        nextLinkClassName={'page-link'}
        nextClassName={'page-item'}
        pageClassName={'page-item'}
        pageCount={data.totalPages}
        pageLinkClassName={'page-link'}
        pageRangeDisplayed={5}
        previousLabel={'previous'}
        previousLinkClassName={'page-link'}
        previousClassName={'page-item'}
      />
    ) :
    null;

  const showArrow = propName => {
    let [key, sort] = sortOrder.split("_");
    if (key !== propName) {
      return null;
    }

    switch (sort) {
      case "desc":
        return <span>&#8593;</span>;
      case "asc":
      default:
        return <span>&#8595;</span>; // down
    }
  };

  const handleOnSortClick = propName => {
    let [key, sort] = sortOrder.split("_");

    if (key !== propName) {
      key = propName;
      sort = "asc";
    } else {
      sort = sort === "asc" ? "desc" : "asc";
    }

    dispatch(setQueryParams({ ...queryParams, sortOrder: `${key}_${sort}` }));
  };

  return (
    <div>
      <div className="container-fluid">
        <div className="row">
          <div className="col-3">
            <Form inline>
              <FormGroup>
                <Input type="search" className="form-control" id="searchString" placeholder="Search..." onChange={(e) => debounced(e.target.value)} />
              </FormGroup>
            </Form>
          </div>
          <div className="col-8 text-right">
            {successMsg && <UncontrolledAlert color="success">{successMsg}</UncontrolledAlert>}
          </div>
          <div className="col-1 text-right">
            <Button color="primary" size="sm" onClick={e => dispatch(update(emptyMovie))} disabled={disabled}>Add</Button>
          </div>
        </div>
        <div className="row">
          <br />
        </div>
        <div className="row">
          <div className="col-12">
            <Table size="sm" hover>
              <thead>
                <tr>
                  <th><a onClick={(e) => handleOnSortClick('title')}>Title {showArrow('title')}</a></th>
                  <th><a onClick={(e) => handleOnSortClick('date')}>Release Date {showArrow('date')}</a></th>
                  <th><a onClick={(e) => handleOnSortClick('genre')}>Genre {showArrow('genre')}</a></th>
                  <th><a onClick={(e) => handleOnSortClick('price')}>Price {showArrow('price')}</a></th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {tbody}
              </tbody>
            </Table>
            {pager}
            <MovieModal queryParams={queryParams} />
            <ConfirmModal />
          </div>
        </div>
      </div>
    </div>
  )
}
