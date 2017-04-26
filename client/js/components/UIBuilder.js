import React, { Component } from 'react';
import cx from 'classnames';
import {init} from '../actions/UIBuilderActions';
import {connect} from 'react-redux';

class UIBuilder extends Component {
	
	constructor(props){
		super(props);		
	} 

	componentDidMount(){
		console.log("ok mounted unibuiolder");
		console.log(this.props);
		
		const {dispatch, data} = this.props;
		dispatch(init(data.sourceId));
	}

	render() {
		const {w,h,data} = this.props;
		return <h1> ui builder! </h1>
	}

};

function select(state) {
  return {
    dimensions: state.screen.dimensions,
  	//templates: state.uibuilder.templates,
  	//mappings: state.uibuilder.mappings,
  	//transformers: state.uibuilder.transformers,
  };
}

UIBuilder.contextTypes = {
	store: React.PropTypes.object,
}

export default connect(select)(UIBuilder);