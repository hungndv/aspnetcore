using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using ReactAu.Data;
using ReactAu.Models;
using ReactAu.ViewModels;

namespace ReactAu.Controllers
{
    //[Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class MoviesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public MoviesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: Movies
        [HttpGet]
        [Route("get")]
        public async Task<ActionResult<PaginatedList<Movie>>> Get(string searchString = "", int? pageIndex = 1, string sortOrder = "title_asc", int? pageSize = 5)
        {
            Task.Delay(2000).Wait();

            pageIndex = pageIndex.HasValue ? pageIndex.Value : 1;

            var movies = from m in _context.Movie
                           select m;
            if (!string.IsNullOrEmpty(searchString))
            {
                movies = movies.Where(m => m.Title.Contains(searchString)
                || m.ReleaseDate.ToString().Contains(searchString)
                || m.Genre.Contains(searchString)
                || m.Price.ToString().Contains(searchString));
            }
            switch (sortOrder)
            {
                case "title_desc":
                    movies = movies.OrderByDescending(m => m.Title);
                    break;
                case "date_asc":
                    movies = movies.OrderBy(m => m.ReleaseDate);
                    break;
                case "date_desc":
                    movies = movies.OrderByDescending(m => m.ReleaseDate);
                    break;
                case "genre_asc":
                    movies = movies.OrderBy(m => m.Genre);
                    break;
                case "genre_desc":
                    movies = movies.OrderByDescending(m => m.Genre);
                    break;
                case "price_asc":
                    movies = movies.OrderBy(m => m.Price);
                    break;
                case "price_desc":
                    movies = movies.OrderByDescending(m => m.Price);
                    break;
                case "title_asc":
                default:
                    movies = movies.OrderBy(m => m.Title);
                    break;
            }

            return Ok(await PaginatedList<Movie>.CreateAsync(movies.AsNoTracking(), pageIndex ?? 1, pageSize.Value));
        }

        // POST: Movies/Create
        // To protect from overposting attacks, enable the specific properties you want to bind to, for 
        // more details, see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [Route("add")]
        public async Task<ActionResult<Movie>> Add([Bind("Title,ReleaseDate,Genre,Price")][FromBody] Movie movie)
        {
            Task.Delay(2000).Wait();
            if (ModelState.IsValid)
            {
                _context.Add(movie);
                await _context.SaveChangesAsync();
                return Ok(movie);
            }
            return BadRequest(GetErrorMessages());
        }

        [HttpPost]
        [Route("update")]
        public async Task<ActionResult<Movie>> Update([FromBody] Movie movie)
        {
            Task.Delay(2000).Wait();
            //return BadRequest(new List<string> { "Server error", "Something wrong" });

            if (ModelState.IsValid)
            {
                try
                {
                    _context.Update(movie);
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!MovieExists(movie.Id))
                    {
                        return NotFound();
                    }
                    else
                    {
                        throw;
                    }
                }
                return Ok(movie);
            }
            return base.BadRequest(GetErrorMessages());
        }

        private List<char> GetErrorMessages()
        {
            return ModelState.Values.SelectMany(v => v.Errors).SelectMany(e => e.ErrorMessage).ToList();
        }

        [HttpPost]
        [Route("delete")]
        public async Task<IActionResult> Delete([FromBody] Movie movie)
        {
            var foundMovie = await _context.Movie.FindAsync(movie.Id);
            if (foundMovie != null)
            {
                _context.Movie.Remove(foundMovie);
                await _context.SaveChangesAsync();
                return Ok();
            }
            else
            {
                return BadRequest("Movie is not found.");
            }
        }

        private bool MovieExists(int id)
        {
            return _context.Movie.Any(e => e.Id == id);
        }
    }
}
