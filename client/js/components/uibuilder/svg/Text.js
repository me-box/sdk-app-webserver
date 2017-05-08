import React, { PureComponent } from 'react';
import {Motion, spring} from 'react-motion';
import {schemaLookup, camelise, camelCase, interpolatedStyles,componentsFromTransform} from '../../../utils/utils';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';

const schema = {...schemaLookup("text").attributes, ...schemaLookup("text").style};
const styles = Object.keys(schemaLookup("text").style).map((c)=>camelCase(c));

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
export default class Text extends PureComponent {

	static defaultProps = {
   		transform: "translate(0,0)"
  	};

  	shouldComponentUpdate(nextProps, nextState){
		return this.props.node != nextProps.node;
	}

	render(){
		const {node} = this.props;
		const {x,y,text,transform="translate(0,0)", style} = node;

		const {scale=1,rotate,translate} = componentsFromTransform(transform);
		const [degrees=0,cx=0,cy=0] = rotate || [0,0,0];

		const _style = camelise(style);
		const is = _interpolatedStyles(_style);
		
		const motionstyle = {
			x: spring(Number(x) || 0),
			y: spring(Number(y) || 0), 
			scale: spring(Number(scale)),
			degrees: spring(Number(degrees)),
			interpolatedStyles: is,
			//fontSize: _style.fontSize || 0,
		}

		return (<Motion style={motionstyle}>
			 		{({x,y,scale,degrees,interpolatedStyles/*,fontSize*/}) => {
			 				const _s = Object.assign({},_style,interpolatedStyles);//,{fontSize:`${fontSize}px`});
			 				//const _s = Object.assign({},_style,item,{fontSize:`${item.fontSize}px`});

			 				const _transform = `translate(${x}, ${y}) scale(${scale}) rotate(${degrees},${cx},${cy})`;
			 				
			 				return 	<g transform={_transform}>
			 							<text textAnchor="middle" x={0} y={0} style={_s}>{text}</text>
			 						</g>
			 			}
			 		}
				</Motion>)
	}

}