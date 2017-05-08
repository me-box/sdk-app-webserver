import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {Circle,Ellipse,Text,Rect,Line,Path,Group} from '../svg/';
import {init} from '../../../actions/UIBuilderActions';

class UIBuilder extends Component {

  constructor(props, context){
  	super(props, context);
  }	

  componentDidMount(){
    const {dispatch, sourceId} = this.props;
    dispatch(init(sourceId));
  }

  renderNode(sourceId, node){
     
     
      const {nodesById} = this.props;


      const shapeprops = {
        id: node.id,
        sourceId,
      }

      switch(node.type){
          
          case "circle":
            return <Circle key={node.id} {...shapeprops}/>

          case "ellipse":
            return <Ellipse key={node.id} {...shapeprops}/>

          case "rect":
            return <Rect key={node.id} {...shapeprops}/>
          
          case "text":
            return <Text key={node.id} {...shapeprops}/>

          case "path":
            return <Path key={node.id} {...shapeprops}/>
          
          case "line":
            return <Line key={node.id} {...shapeprops}/>

          case "group":
            return <Group key={node.id} {...{
                id: node.id,
                sourceId,
                nodesById,
            }}/>

       }
       return null;
  }

  renderNodes(){
      //eventually can just pass in the id, and nodes will do the rest themselves.
  

      const {nodes, nodesById, sourceId} = this.props;
   

      return nodes.map((id)=>{
        return this.renderNode(sourceId, nodesById[id]);
      });
  }

  render() {

  	const {dimensions:{w,h}} = this.props;

    return <div className="canvas" style={{width:"100%", height:"100%"}}>
      <svg id="svgchart" viewBox={`0 0 ${w} ${h}`} width={w} height={h}>
    		{this.renderNodes()}	
    	</svg>
    </div>
  }
}


function select(state, newProps) {

  return {
    dimensions: state.screen.dimensions,
    nodes: state.uibuilder[newProps.sourceId] ? state.uibuilder[newProps.sourceId].nodes : [],
    nodesById: state.uibuilder[newProps.sourceId] ? state.uibuilder[newProps.sourceId].nodesById : {},
  };
}

UIBuilder.contextTypes = {
  store: React.PropTypes.object,
}

export default connect(select)(UIBuilder);