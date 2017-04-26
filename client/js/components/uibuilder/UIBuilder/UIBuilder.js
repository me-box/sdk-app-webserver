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

  renderNode(node){
     
      const {nodesById} = this.props;

      switch(node.type){
          
          case "circle":
            return <Circle key={node.id} id={node.id}/>

          case "ellipse":
            return <Ellipse key={node.id} id={node.id}/>

          case "rect":
            return <Rect key={node.id} id={node.id}/>
          
          case "text":
            return <Text key={node.id} id={node.id}/>

          case "path":
            return <Path key={node.id} id={node.id}/>
          
          case "line":
            return <Line key={node.id} id={node.id}/>

          case "group":
            return <Group key={node.id} {...{
                id: node.id,
                nodesById,
            }}/>

       }
       return null;
  }

  renderNodes(){
      //eventually can just pass in the id, and nodes will do the rest themselves.
      const {nodes, nodesById} = this.props;
     
      return nodes.map((id)=>{
        return this.renderNode(nodesById[id]);
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


function select(state) {
  return {
    dimensions: state.screen.dimensions,
    nodes: state.uibuilder.nodes,
    nodesById: state.uibuilder.nodesById,
  };
}

UIBuilder.contextTypes = {
  store: React.PropTypes.object,
}

export default connect(select)(UIBuilder);