import React, { useState } from 'react';
import { Button, Form, FormGroup, Input, Label, Spinner, Table, UncontrolledAlert } from 'reactstrap';
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
  const { searchString, pageIndex, sortOrder, pageSize } = queryParams;
  const { successMsg } = useSelector(state => state.movie);
  const dispatch = useDispatch();

  const { data, refetch, isLoading, isFetching, isSuccess, isError, error } = useGetMoviesQuery(queryParams);

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
        forcePage={data.pageIndex - 1}
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

  const handleOnConfirmModalExit = () => {

  };

  const pageSizeComp = (
    <FormGroup className="form-inline">
      <Label for="pageSize">Size</Label>&nbsp;
      <Input type="select"
        name="pageSize" id="pageSize"
        value={pageSize}
        onChange={e => dispatch(setQueryParams({ ...initialState.queryParams, searchString: searchString, pageSize: e.target.value }))}>
        <option value="5">5</option>
        <option value="10">10</option>
        <option value="25">25</option>
      </Input>
    </FormGroup>
  );

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
            <MovieModal queryParams={queryParams} />
            <ConfirmModal onExit={handleOnConfirmModalExit} />
          </div>
        </div>
        <div className="row">
          <div className="col-3 d-flex align-items-center">
            <span>{data && data.items ? `Showing ${(pageIndex - 1) * pageSize + 1} to ${(pageIndex - 1) * pageSize + data.items.length} of ${data.totalCount} entries` : ''}</span>
          </div>
          <div className="col-6 d-flex justify-content-center align-items-center">
            {pager}
          </div>
          <div className="col-3 form-row d-flex justify-content-right align-items-center">
            {pageSizeComp}
          </div>
        </div>
      </div>
    </div>
  )
}
