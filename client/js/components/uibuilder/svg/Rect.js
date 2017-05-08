import React, { PureComponent } from 'react';
import {Motion, spring} from 'react-motion';
import {schemaLookup, camelise, camelCase, interpolatedStyles,componentsFromTransform} from '../../../utils/utils';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';

const schema = {...schemaLookup("rect").attributes, ...schemaLookup("rect").style};

const styles = Object.keys(schemaLookup("rect").style).map((c)=>camelCase(c));

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

@connect(selector)
export default class Rect extends PureComponent {

	shouldComponentUpdate(nextProps, nextState){
		return this.props.node != nextProps.node;
	}

	render(){
		
		const {node} = this.props;
		const {x,y,rx,ry,width,height,transform="translate(0,0)",style} = node;
		const _style = camelise(style);
		const is = _interpolatedStyles(_style)
		const {scale=1,rotate=[0,0,0],translate} = componentsFromTransform(transform);
		
		const cx = Number(rotate[1]) || 0;
		const cy = Number(rotate[2]) || 0;

		const motionstyle = {
			x: spring(Number(x) || 0),
			y: spring(Number(y) || 0), 
			width:spring(Number(width) || 0),
			height:spring(Number(height) || 0),
			scale: spring(Number(scale)),
			rotate: spring(Number(rotate[0]) || 0),
			interpolatedStyles: is
		}

		return <Motion style={motionstyle}>
	 				{({x,y,width,height,scale,rotate,interpolatedStyles}) => {
			 			const _s = Object.assign({},_style,interpolatedStyles);
	 					const _transform = `translate(${x}, ${y}) scale(${scale}) rotate(${rotate},${cx},${cy})`;
	 					return <rect rx={rx} ry={ry} width={width} height={height} style={_s} transform={_transform}/>
					}}	 
				</Motion>
	}

}