var React             = require('react');
var Stars             = require('../data/Stars.js');
var StarChart         = require('./StarChart.jsx');
var ShipInfo          = require('./ShipInfo.jsx');
var Navigation        = require('./Navigation.jsx');
var SetIntervalMixin  = require('../mixins/SetIntervalMixin.jsx');
var nav               = require('../utilities/starshipNavigation.js');

var App = React.createClass({

	mixins: [SetIntervalMixin],

	getInitialState: function() {
    return {
      ship: {
        info: {
          shipName: null,
          captain: null,
          firstOfficer: null,
          chiefEngineer: null,
          tacticalOfficer: null,
          helmsman: null
        },
        position: [500, 300],
        destination: 
        {
          name: 'Sol',
          position: [500, 300],
          jurisdiction: 'Federation'
        },
        destinations: [],
        speed: 0
      }
    };
  },

	render: function(){
		var ship = this.state.ship;
		var stars = Stars.getStarData();
		return (
			<div>
				<StarChart starData={stars} ship={ship} updateDestination={this.updateDestination} />
				<div className="helm">
					<div id="helm-header">
						<h1>Helm Control</h1>
					</div>
					<ShipInfo ship={ship} updateShip={this.updateShip} />
					<Navigation 
						ship={ship}
						stars={stars}
						updateSpeed={this.updateSpeed}
						engageWarpDrive={this.engageWarpDrive}
						updateDestination={this.updateDestination} />
				</div>
			</div>
		);
	},

	updateShip: function(ship){
		this.setState({ship: ship});
	},

	updateSpeed: function(newSpeed){
		var ship = this.state.ship;
	    ship.speed = newSpeed;
	    this.setState({ship: ship});
	},

	engageWarpDrive: function(){
		this.setInterval(this.updateShipPositionOnEventQueue, 10);
	},

	updateShipPositionOnEventQueue: function(){
		setTimeout(this.updateShipPosition(), 0);
	},

	updateDestination: function(destination){
		// not called when ship is moving... race-condition
		// works when you extend the update time to 1000 instead
		// of 10
		console.log(destination);
		var ship = this.state.ship;
		if(ship.destination){
			ship.destinations.push(destination);	
		} else {
			ship.destination = destination;
		}
		
		this.setState({ship: ship});
	},

	reachedCurrentDestination: function(){
		var ship = this.state.ship;
		if(ship.destinations.length > 0){
			var nextDest = ship.destinations.shift();
			ship.destination = nextDest;
			this.setState({ship: ship});
			return true;
		}
		return false;
	},

	updateShipPosition: function(){
		var ship = this.state.ship;
		var reachedDestination = nav.destinationReached(ship);

		if (reachedDestination) {
			// we reach the current destination
			if(ship.destinations.length === 0){
				// there are no more destinations
				this.clearIntervals();
			} else {
				// there are more destinations to get to
				var nextDest = ship.destinations.shift();
				ship.destination = nextDest;
				this.setState({ship:ship});
			}
		} else {
			// not yet reached the current position
			var nextPos = nav.nextPositionToDestination(ship);
			ship.position = nextPos;
			this.setState({ship: ship});
		}
	}
});

module.exports = App;