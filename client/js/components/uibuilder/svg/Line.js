import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import {nodeClicked} from '../../../actions/UIBuilderActions';
import { bindActionCreators } from 'redux';

const selector = createStructuredSelector({
  node : (state, ownProps)=>{
   return state.uibuilder[ownProps.sourceId].nodesById[ownProps.id]
  },
});

@connect(selector, (dispatch) => {
  return {
  	  displayProvenance : bindActionCreators(nodeClicked, dispatch),
   }
})
export default class Line extends PureComponent {

	shouldComponentUpdate(nextProps, nextState){
		return this.props.node != nextProps.node;
	}

	render(){
		const {node, sourceId} = this.props;
		const {x1,x2,y1,y2,transform="translate(0,0)"} = node;

		const style ={
			stroke: "#000",
			strokeWidth: 2
		}
		return <line onClick={()=>{this.props.displayProvenance(sourceId, node.id)}} x1={x1} x2={x2} y1={y1} y2={y2} style={style}/>
	}
}