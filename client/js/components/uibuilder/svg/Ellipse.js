import React, { PureComponent } from 'react';
import {Motion, spring} from 'react-motion';
import {schemaLookup, camelise, camelCase, interpolatedStyles, componentsFromTransform}  from '../../../utils/utils';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import {nodeClicked} from '../../../actions/UIBuilderActions';
import { bindActionCreators } from 'redux';

const schema = {...schemaLookup("ellipse").attributes, ...schemaLookup("ellipse").style};
const styles = Object.keys(schemaLookup("ellipse").style).map((c)=>camelCase(c));

const types = Object.keys(schema).reduce((acc,key)=>{
	acc[camelCase(key)] = schema[key].type;
	return acc;
},{});

const _interpolatedStyles = interpolatedStyles.bind(null,styles,types);

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
export default class Ellipse extends PureComponent {	

	shouldComponentUpdate(nextProps, nextState){
		return this.props.node != nextProps.node;
	}

	render(){
		const {node, sourceId} = this.props;
		const {cx,cy,rx,ry, style, transform="translate(0,0)"} = node;
		
		const _style = camelise(style);
		const is = _interpolatedStyles(_style);
		const {scale=1,rotate=[0,0,0],translate} = componentsFromTransform(transform);
		const [x,y]= translate || [0,0];

		const motionstyle = {
			cx: spring(Number(cx) || 0),
			cy: spring(Number(cy) || 0),
			rx:spring(Number(rx) || 0),
			ry:spring(Number(ry) || 0),
			scale: spring(Number(scale)),
			rotate: spring(Number(rotate[0]) || 0),
			interpolatedStyles: is,
		}

		return (<Motion style={motionstyle}>
	 				{({cx,cy,scale,r,rotate,interpolatedStyles}) => {
	 					const _s = Object.assign({},_style,interpolatedStyles);
	 					const _transform = `translate(${cx}, ${cy}) scale(${scale}) rotate(${rotate})`;
	 					return <ellipse onClick={()=>{this.props.displayProvenance(sourceId, node.id)}} cx={0} cy={0} rx={rx} ry={ry} style={_s} transform={`${_transform}`} />
	 													
	 					
				 	}}	 
				</Motion>)

	}
}