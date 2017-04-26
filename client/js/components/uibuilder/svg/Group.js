import React, { PureComponent } from 'react';
import {Motion, spring} from 'react-motion';
import {Circle, Text, Line, Rect, Ellipse,Path} from "./"
import {camelise, camelCase, componentsFromTransform, interpolatedStyles, schemaLookup} from '../../../utils/utils';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';

const styles = Object.keys(schemaLookup("group").style).map((c)=>camelCase(c));

const schema = {...schemaLookup("group").attributes, ...schemaLookup("group").style};

const types = Object.keys(schema).reduce((acc,key)=>{
	acc[camelCase(key)] = schema[key].type;
	return acc;
},{});

const _interpolatedStyles = interpolatedStyles.bind(null,styles,types);

const selector = createStructuredSelector({
  node : (state, ownProps)=>{
    return state.uibuilder.nodesById[ownProps.id]
  },
});

@connect(selector)
export default class Group extends PureComponent {

	renderChildren(children, path){

		//const {onSelect} = this.props;
		const {nodesById} = this.props;

		return children.map((key)=>{
			
			const item = nodesById[key];

			switch(item.type){
				
				case "circle":
					return <Circle key={item.id} id={item.id}/>
			 	
			 	case "ellipse":
					return <Ellipse key={item.id} id={item.id}/>

				case "rect":
					return <Rect key={item.id} id={item.id}/>

				case "text":
					return <Text key={item.id} id={item.id}/>

				case "line":
					return <Line key={item.id} id={item.id}/>

			 	case "path":
					return <Path key={item.id} id={item.id}/>

				case "group":
					return <Group key={item.id} {...{...this.props, ...{id:item.id}}}/>
					
				default:
					return null;
			}
		});
	}

	shouldComponentUpdate(nextProps, nextState){
		return nextProps.nodesById[nextProps.id] != this.props.nodesById[this.props.id];
	}

	render(){

		const {id, nodesById} = this.props;		
		const node = nodesById[id];
		const {x=0, y=0, width, height, style, transform="translate(0,0)", children} = node;

		const _style = camelise(style);
		const is = _interpolatedStyles(_style);
		const {scale=1,rotate,translate} = componentsFromTransform(transform);
		const [degrees,cx=0,cy=0] = rotate || [0,0,0];
	
		//adjust translate x, translate y so we scale around the center!
		const sfcx = scale  ? -(width/2) * (Number(scale)-1) : 0;
		const sfcy = scale  ? -(height/2) * (Number(scale)-1) : 0;

		const motionstyle = {
			x: spring(Number(x)+sfcx),//spring(Number(x ? x+sfcx : sfcx) || sfcx),
			y: spring(Number(y)+sfcy),//spring(Number(y ? y+sfcy : sfcy) || sfcy),
			scale: spring(Number(scale ? scale : 0) || 0),
			degrees: spring(Number(rotate ? rotate[0] : 0) || 0),
			interolatedStyles: is,
		}

		return (<Motion style={motionstyle}>
	 				{({x,y,scale,degrees,interpolatedStyles}) => {
	 					const _s = Object.assign({},_style,interpolatedStyles);
	 					const _transform = `translate(${x}, ${y}) scale(${scale}) rotate(${degrees},${cx},${cy})`;
	 					return <g transform={`${_transform}`} style={_s}>
	 						{this.renderChildren(children)}
	 					</g>								
	 					
				 	}}	 
				</Motion>)

	}
}