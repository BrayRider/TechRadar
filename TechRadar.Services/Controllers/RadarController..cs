﻿using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;
using System.Collections.Generic;
using System.Linq;
using TechRadar.Services.Models;

namespace TechRadar.Services.Controllers
{
    [Route("api/[controller]")]
    public class RadarController : Controller
    {
        // GET: api/radar
        [HttpGet]
        public IEnumerable<Radar> Get()
        {
            MongoDBContext dbContext = new MongoDBContext();
            var filter = new BsonDocument();

            var radarList = dbContext.Radars.Find(m => true).ToList();

            return radarList;
        }

        // GET api/radar/5
        [HttpGet("{id}")]
        public Radar Get(string id)
        {
            MongoDBContext dbContext = new MongoDBContext();

            Radar radar = dbContext.Radars.Find(m => m.RadarId == id).ToList().FirstOrDefault<Radar>();

            return radar;
        }

        // GET api/radar/5/blips
        [HttpGet("{id}/blips")]
        public IEnumerable<Blip> GetBlips(string id)
        {
            var radar = Get(id);

            if(radar != null)
            {
                MongoDBContext dbContext = new MongoDBContext();

                var blips = dbContext.Blips.Find(m => m.RadarId == radar.Id).ToList();

                return blips.ToList();
            }

            return new List<Blip>();
        }

        // GET api/radar/5/blips/3
        [HttpGet("{id}/blips/{quadrantNumber}")]
        public IEnumerable<Blip> GetBlips(string id, int quadrantNumber)
        {
            var radar = Get(id);
            Quadrant quadrant;

            var filterBuilder = Builders<Blip>.Filter;

            if (radar != null)
            {
                var filter = filterBuilder.Eq(x => x.RadarId, radar.Id);

                if (radar.Quadrants != null)
                {
                    quadrant = radar.Quadrants.FirstOrDefault<Quadrant>(x => x.QuadrantNumber == quadrantNumber);
                    if(quadrant != null)
                    {
                        filter = filter & filterBuilder.Eq(x => x.QuadrantId, quadrant.Id);
                    }
                }

                MongoDBContext dbContext = new MongoDBContext();

                var blips = dbContext.Blips.Find(filter).ToList();

                return blips.ToList();
            }

            return new List<Blip>();
        }

        // POST api/radar
        [HttpPost]
        public void Post([FromBody]string value)
        {
        }

        // PUT api/radar/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE api/radar/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
