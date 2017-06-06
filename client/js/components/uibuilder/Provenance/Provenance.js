import React, { Component } from 'react';
import { connect } from 'react-redux';
import {TREEPADDING, TREEMARGIN, NODEWIDTH, NODEHEIGHT} from '../../../constants/ViewConstants';
import { Flex, Box } from 'reflexbox';
import {selectMapping} from '../../../actions/UIBuilderActions';
import { bindActionCreators } from 'redux';
import '../../../../style/font-awesome/css/font-awesome.min.css';

const _link = (d)=>{
  return "M" + d.source.x + "," + d.source.y
      + "C" + (d.source.x + d.target.x) / 2 + "," + d.source.y
      + " " + (d.source.x + d.target.x) / 2 + "," + d.target.y
      + " " + d.target.x + "," + d.target.y;
}

const _links = (node)=>{
  if (node.children){
      return _flatten(node.children.map((child)=>{
         
          return [
                  {
                      source: {
                        x:node.x,
                        y:node.y, 
                        nid: node.data.node.nid,
                      }, 
                      target: {
                        x:child.x, 
                        y:child.y,
                        nid:child.data.node.nid,
                      }
                  },
                  ..._links(child)]
      }))
  }
  return [];
}

const _flatten = list => list.reduce(
    (a, b) => a.concat(Array.isArray(b) ? _flatten(b) : b), []
);


const _datafor = (link, datapath)=>{
  return datapath.hops.reduce((acc, item)=>{
    //console.log(`checking ${link.target.nid}->${link.source.nid} against ${item.source}->${item.target}`)
    if (item.source === link.target.nid && item.target === link.source.nid){
      return datapath.data[item.msg];
    }
    return acc;
  },{});
}

class Provenance extends Component {


  constructor(props, context){
    super(props, context);
    this.state = {datalink:null, mapping: {}};
    this.selectMapping = bindActionCreators(selectMapping, this.props.dispatch);
  } 

  /*_mapping(){
    const {provenance} = this.props;

    if (this.state.mapping && Object.keys(this.state.mapping).length > 0){
      return this.state.mapping;
    }

    if (provenance[0] && provenance[0].mappingId && provenance[0].sourceId){
      return  {mappingId:provenance[0].mappingId, sourceId:provenance[0].sourceId} 
    }

    return {};
  }*/


  renderTree(){
    const {provenance, dimensions:{h}, w} = this.props;
    const treeheight = h * 0.6;
    const containerheight = treeheight + NODEHEIGHT;
    const {mappingId} = this.props.selectedMapping; //this._mapping();

    if (mappingId){
        
        const tree = provenance.reduce((acc, item)=>{
          if (item.mappingId === mappingId){
            acc = item.tree;
          }
          return acc;
        },{});

        return <div style={{background:'#F6F3EC'}}>
          <svg key={mappingId} width={w} height={containerheight}>
              <g transform={`translate (0,${TREEMARGIN + NODEHEIGHT/2})`}>
               {this.renderTreeLinks(tree)}
               {this.renderTreeNodes(tree)}
               {this.renderResult()}
               {this.renderTreeData(tree)}
              </g>  
          </svg>
        </div>
    }
    return null;
  }

  renderResult(){
      const {provenance, dimensions:{h}, w} = this.props;

    
      const {mappingId, sourceId} = this.props.selectedMapping;

      const result = this.props.datapath[sourceId] ? this.props.datapath[sourceId].result[mappingId] || "-" : "-";

      const treeheight = h * 0.6;

      const resultstyle = {
        textAnchor: 'middle',
      }
      return <g transform={`translate(0,${treeheight-NODEHEIGHT/2})`}>
                <text style={resultstyle} x={w/2} y={0}> {result} </text>
             </g>
  }


  renderTreeNodes(node){

      if (!node.data || !node.data.node){
        return null;
      }

      const children = node.children ?  node.children.map((child)=>{
          return this.renderTreeNodes(child);       
      }) : null;
    
      let mainrectprops = {
          fill: "white",
          width: NODEWIDTH,
          height: NODEHEIGHT,
          x: node.x - NODEWIDTH /2,
          y: node.y - NODEHEIGHT/2,
          stroke: "#454545",
          strokeWidth: 2,
      }

     

      if (node.data.node.category === "result"){
            mainrectprops = {
              ...mainrectprops,
              x: node.x - this.props.w/2,
              width: this.props.w,
              stroke: "none",
              strokeWidth: 0,
            }
      }
      else{
          mainrectprops = {
            ...mainrectprops,
            fill: node.data.node.color,
          }
      }
      

      const textprops = {
        y: node.y + 10,
        x: node.x,
      }

      const icontxt = node.data.node.unicode || '\uf040'
      
      const iconstyle = {
          fontFamily: 'FontAwesome',
          fontSize: 30,
          fill: 'white',
          textAnchor: 'middle',
          WebkitTouchCallout: 'none',
          WebkitUserSelect: 'none',   
          KhtmlUserSelect: 'none',   
          MozUserSelect: 'none',   
          MsUserSelect: 'none',       
          userSelect: 'none',  
      }

      return  <g key={node.data.node.nid}>
                  <rect className="node" {...mainrectprops}></rect>
                  <text style={iconstyle} {...textprops}>{icontxt}</text>
                  {children}
              </g>

  }

  renderTreeLinks(node){
      const links = _links(node);
      return links.map((link, i)=>{
          return <path key={i} style={{fill:"none", stroke:"#454545", strokeWidth:2}} d={_link(link)}/>
      });
  }

  renderTreeData(node){
     
     const {mappingId} = this.props.selectedMapping;
     const [first, ...links] = _links(node)

     return links.map((link, i)=>{
  
        const props = {
          cx: link.target.x + (link.source.x-link.target.x)/2,
          cy: link.target.y + (link.source.y-link.target.y)/2,
          r:10,
        }

        const style ={
          fill: 'white',
          stroke: '#454545',
          strokeWidth: 2,
        }

        return <circle onClick={()=>{this.setState({datalink:{[mappingId]:link}})}} key={i} {...props} style={style}></circle>
     });
  }

  

  renderData(){

    const {w} = this.props;

    if (!this.state.datalink){
      return null;
    }

    const {mappingId, sourceId} = this.props.selectedMapping;

    if (mappingId && sourceId){

      const datastyle = {   
          margin:0,
          padding: 10,
          width: w,
          overflow:'auto',
      }

      const link = this.state.datalink[mappingId];
     
      let data = null;

      if (link && this.props.datapath[sourceId]){
        data = _datafor(link,  this.props.datapath[sourceId].path);
      }

      let datastr = "";

      if (data){
        datastr = JSON.stringify(data.payload ? data.payload : data, null, 4);
      }
      
      return <div style={datastyle}>
                <pre>{datastr}</pre>
            </div>
    }
    

  }

  renderMenu(){
      const {provenance, sourceId} = this.props;
      
      const menuItems = provenance.map((mapping, i)=>{
          return <Box onClick={()=>{this.selectMapping(sourceId, {mappingId: mapping.mappingId, sourceId: mapping.sourceId})}} key={i} p={3} auto>
                      <div style={{textAlign:"center"}}>
                        {mapping.mappingId}
                      </div>
                    </Box>
                
      })

      
      return <Flex align="center" style={{overflow:'auto'}}>
               {menuItems}
             </Flex>
  }

  renderClose(){
    const style = {
      position: 'absolute',
      right: 7,
      top: 7,
      fontFamily:"FontAwesome",
    }

    return <div style={style} onClick={this.props.close}><i className="fa fa-times"></i></div>
  }

  render(){
    const {provenance, dimensions:{h}, w} = this.props;
    
    if (provenance && provenance.length > 0){
      return  <div style={{top: 0, right: 0, background:"#e3e3e3", opacity:0.95, position:"absolute", height:h, width:w}}>    
                  {this.renderMenu()}
                  {this.renderTree()}
                  {this.renderData()}
                  {this.renderClose()}
              </div>
    }
    return null;
  }
}

function select(state, newProps) {
  return {
    dimensions: state.screen.dimensions,
    provenance: state.uibuilder[newProps.sourceId] ? state.uibuilder[newProps.sourceId].provenance ? state.uibuilder[newProps.sourceId].provenance : [] : [],
    datapath: state.uibuilder[newProps.sourceId] ? state.uibuilder[newProps.sourceId].datapath : {},
    selectedMapping: state.uibuilder[newProps.sourceId] ? state.uibuilder[newProps.sourceId].selectedMapping : null,
    selectedSource: state.uibuilder[newProps.sourceId] ? state.uibuilder[newProps.sourceId].selectedSource: null,
  };
}

Provenance.contextTypes = {
  store: React.PropTypes.object,
}

export default connect(select)(Provenance);