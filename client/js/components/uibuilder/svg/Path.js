import React, { PureComponent } from 'react';
import { camelise,componentsFromTransform } from '../../../utils/utils';
import { connect } from 'react-redux';
import {Motion, spring} from 'react-motion';
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
export default class Path extends PureComponent {

	shouldComponentUpdate(nextProps, nextState){
		return this.props.node != nextProps.node;
	}

	render(){

		const {node, sourceId} = this.props;
		const {d, style, transform="translate(0,0)"} = node;
		const _style = camelise(style);
	
		const {scale=1,rotate,translate} = componentsFromTransform(transform);
		const [x=0,y=0]= translate || [0,0];

		const [deg=0,cx=0, cy=0] = rotate || [];

		const motionstyle = {
			scale: spring(Number(scale)),
			degrees: spring(Number(deg)),
			x: spring(Number(x) || 0),
			y: spring(Number(y) || 0)
		}

		return 	<Motion style={motionstyle}>
	 				{({x,y,scale,degrees}) => {
	 					const _transform = `translate(${x},${y}) scale(${scale}) rotate(${degrees}, ${cx}, ${cy})`;
	 					return <path onClick={()=>{this.props.displayProvenance(sourceId, node.id)}} d={d} style={_style} transform={_transform}/>
	 							
	 				}}	 
				</Motion>
	}

}