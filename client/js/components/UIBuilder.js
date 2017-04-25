import React, { Component } from 'react';
import cx from 'classnames';
import {init} from '../actions/UIBuilderActions';

class UIBuilder extends Component {
	
	constructor(props){
		super(props);
	} 

	componentDidMount(){
		const {nid} = this.props;
		init(nid);
  	}

	render() {
		const {w,h,data} = this.props;	
	}

};

function select(state) {
  return {
    dimensions: state.screen.dimensions,
  	templates: state.uibuilder.templates,
  	mappings: state.uibuilder.mappings,
  	transformers: state.uibuilder.transformers,
  };
}

AppContent.contextTypes = {
	store: React.PropTypes.object,
}

export default connect(select)(UIBuilder);