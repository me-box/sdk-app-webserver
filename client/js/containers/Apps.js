import React, { Component } from 'react';
import AppContent from './AppContent';

class Apps extends Component {
	
	constructor(props){
		super(props);		
	} 

	render() {
	     console.log("in render apps");
	    return (
	    	<div>
	    		<AppContent/>
	    	</div>
	    );
	  }
	};

export default Apps;
