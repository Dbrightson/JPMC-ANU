//planeLayout = new anu.planelayout('name', {options}, scene)
//planeLayout.Update({options})
//planeLayout.Transform({options})
import { Selection } from "../../selection";
import { BoundingInfo, Scene, Vector2, Vector3, Vector4, Mesh, Animation, BezierCurveEase, TransformNode, Quaternion } from "@babylonjs/core";

interface LayoutOptions {
    selection: Selection,
    rows?: number, 
    columns?: number,
    radius?: number,
    margin?: Vector2,
    order?: string[],
  }

export class Layout{
    name: string;
    options: LayoutOptions;
    scene: Scene;
    currentLayout: Number = 0;
    //boundingBox: BoundingInfo;
    
    constructor(name: string, options: LayoutOptions, scene: Scene) {
        this.name = name;
        this.options = options;
        this.scene = scene;
        //this.boundingBox = options.selection.boundingBoxLocal();
    }

    private animatePosition(obj: TransformNode, newPos: Vector3){
        var animationBezierTorus = new Animation("animationBezierTorus", "position", 30, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CONSTANT);
        var keysBezierTorus = [];
        keysBezierTorus.push({ frame: 0, value: obj.position });
        keysBezierTorus.push({ frame: 20, value: newPos });
        animationBezierTorus.setKeys(keysBezierTorus);
        var bezierEase = new BezierCurveEase(0.73, 0, 0.31, 1);
        animationBezierTorus.setEasingFunction(bezierEase);
        obj.animations.length = Math.min(obj.animations.length, 2);
        obj.animations.push(animationBezierTorus);
        this.scene.beginDirectAnimation(obj, [animationBezierTorus], 0, 20, false);
    }

    private animateRotation(obj: TransformNode, newRot: Vector3){
        //check if quaternion is null, if so we use eulerangle
        //helper convert Quaternion.eulerangle
        //set quaternion to null when using rotation, but not the other way
        let keys = [];
        keys.push({frame:0, value: (obj as TransformNode).rotation});
        keys.push({frame:20, value: newRot});
        let animation = new Animation("", "rotation", 20, 
        Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CYCLE);
        animation.setKeys(keys);
        var bezierEase = new BezierCurveEase(0.73, 0, 0.31, 1);
        animation.setEasingFunction(bezierEase);
        this.scene.beginDirectAnimation(obj, [animation], 0, 20, false);
    }

    private animateScale(obj: TransformNode, newScale: Vector3){
        var animationBezierTorus = new Animation("animationBezierTorus", "scaling", 30, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CONSTANT);
        var keysBezierTorus = [];
        keysBezierTorus.push({ frame: 0, value: obj.scaling });
        keysBezierTorus.push({ frame: 10, value: newScale });
        animationBezierTorus.setKeys(keysBezierTorus);
        var bezierEase = new BezierCurveEase(0.73, 0, 0.31, 1);
        animationBezierTorus.setEasingFunction(bezierEase);
        obj.animations.length = Math.min(obj.animations.length, 2);        
        obj.animations.push(animationBezierTorus);
        this.scene.beginDirectAnimation(obj, [animationBezierTorus], 0, 10, true);
    }

    private boundingBoxLocal(selection: Selection): BoundingInfo {

        let selectionMin = new Vector3(0, 0, 0);
        let selectionMax = new Vector3(0, 0, 0);

        selection.selected.forEach((node, i) => {
        let meshes = node.getChildMeshes();
        meshes.forEach((mesh, j) => {
            mesh.computeWorldMatrix(true); //without this the bounding box is calulcated at the mesh creation position...TODO investigate.
            let nodeMin = mesh.getBoundingInfo().boundingBox.minimumWorld.subtract((node as TransformNode).getAbsolutePosition());
            let nodeMax = mesh.getBoundingInfo().boundingBox.maximumWorld.subtract((node as TransformNode).getAbsolutePosition());
            selectionMin = Vector3.Minimize(selectionMin, nodeMin);
            selectionMax = Vector3.Maximize(selectionMax, nodeMax);
            });
        });

        return new BoundingInfo(selectionMin, selectionMax);
    }

    public planeLayout(){
        this.currentLayout = 1;
        let rownum = this.options.rows || 1
        let margin = this.options.margin || new Vector2(0, 0)
        let chartnum = this.options.selection.selected.length
        let boundingBox = this.boundingBoxLocal(this.options.selection)
        let widthX = boundingBox.boundingBox.maximumWorld.x - boundingBox.boundingBox.minimumWorld.x;
        let widthY = boundingBox.boundingBox.maximumWorld.y - boundingBox.boundingBox.minimumWorld.y;
        let colnum = this.options.columns || chartnum;

        colnum = chartnum % rownum == 0 ? chartnum / rownum : Math.floor(chartnum / rownum) + 1;

        let cells : Mesh[] = [];
        
        this.options.selection.selected.forEach((node, i) => {
            if(node.parent == null){
                let m = new Mesh("cell", this.scene);
                m.setBoundingInfo(new BoundingInfo(boundingBox.boundingBox.minimumWorld, boundingBox.boundingBox.maximumWorld));
                m.showBoundingBox = true;
                node.parent = m;
                cells.push(m);
            } else {
                (node.parent as Mesh).setBoundingInfo(new BoundingInfo(boundingBox.boundingBox.minimumWorld, boundingBox.boundingBox.maximumWorld));
                cells.push((node.parent as Mesh));
            }
            this.animatePosition((cells[cells.length - 1]), new Vector3(i % colnum * (widthX + margin.x), Math.floor(i / colnum) * (widthY + margin.y), 0));
            this.animatePosition((node as TransformNode), new Vector3(0, 0, 0))
            this.animateRotation((node.parent as TransformNode), new Vector3(0, 0, 0))
        })
        
        return this;
    }

    public attr(s: string, val: object){
        switch(s){
            case "row":
                this.options.rows = Number(val);
                if(this.currentLayout == 1)
                    planeLayout(this.name, this.options, this.scene);
                if(this.currentLayout == 2)
                    cylinderLayout(this.name, this.options, this.scene);
                break;
            case "margin":
                let newmargin = val as Vector2;
                this.options.margin = newmargin;
                if(this.currentLayout == 1)
                    planeLayout(this.name, this.options, this.scene);
                if(this.currentLayout == 2)
                    cylinderLayout(this.name, this.options, this.scene);
                break;
            default:
                break;
        }
        return this;
    }

    public cylinderLayout(){
        this.currentLayout = 2;
        let rownum = this.options.rows || 1
        let margin = this.options.margin || new Vector2(0,0)
        let chartnum = this.options.selection.selected.length
        let boundingBox = this.boundingBoxLocal(this.options.selection)
        let radius = this.options.radius || 5
        let widthX = boundingBox.boundingBox.maximumWorld.x - boundingBox.boundingBox.minimumWorld.x;
        let widthY = boundingBox.boundingBox.maximumWorld.y - boundingBox.boundingBox.minimumWorld.y;
        let colnum = this.options.columns || chartnum;

        colnum = chartnum % rownum == 0 ? chartnum / rownum : Math.floor(chartnum / rownum) + 1;

        let angle = Math.atan(widthX / 2 / radius) * 2;

        let forward = new Vector3(0, 0, 1);
        let up = new Vector3(0, 1, 0);
        let cells : Mesh[] = [];
        
        this.options.selection.selected.forEach((node, i) => {
            if(node.parent == null){
                let m = new Mesh("cell", this.scene);
                m.setBoundingInfo(new BoundingInfo(boundingBox.boundingBox.minimumWorld, boundingBox.boundingBox.maximumWorld));
                m.showBoundingBox = true
                node.parent = m;
                cells.push(m);
            } else {
                (node.parent as Mesh).setBoundingInfo(new BoundingInfo(boundingBox.boundingBox.minimumWorld, boundingBox.boundingBox.maximumWorld));
                cells.push((node.parent as Mesh));
            }
        })
        
        this.options.selection.selected.forEach((node, i) => {
            let origin = new Mesh("vect", this.scene);
            origin.position = new Vector3(0, 0, 0);
            let rowid = Math.floor(i / colnum);
            let colid = i % colnum;
            origin.rotate((node.parent as TransformNode).getDirection(up), colid * (angle + margin.x * Math.PI / 180));
            let originforward = origin.getDirection(forward).normalize();
            let pos = originforward.multiplyByFloats(radius, radius, radius);
            let newPos = new Vector3(pos.x,  rowid * (widthY + margin.y), pos.z)
            this.animatePosition((node.parent as TransformNode), newPos);
            this.animatePosition((node as TransformNode), new Vector3(0, 0, 0));
            let newRot = origin.rotationQuaternion?.toEulerAngles() || new Vector3(0, 0, 0);
            this.animateRotation((node.parent as TransformNode), newRot);
            origin.dispose();
        })

        return this;
    }
    
    public zalign(){
        let boundingBox = this.boundingBoxLocal(this.options.selection)
        let widthZ = boundingBox.boundingBox.maximumWorld.z - boundingBox.boundingBox.minimumWorld.z;
        this.options.selection.selected.forEach((node, i) => {
            let test = new Selection([this.options.selection.selected[i]], this.scene);
            let zSize = this.boundingBoxLocal(test).boundingBox.maximumWorld.z - this.boundingBoxLocal(test).boundingBox.minimumWorld.z;
            this.animatePosition((node as TransformNode), new Vector3((node as TransformNode).position.x, (node as TransformNode).position.y, zSize / 2 - widthZ / 2));
        })
        return this;
    }

    public stretch(){
        let boundingBox = this.boundingBoxLocal(this.options.selection)
        let widthX = boundingBox.boundingBox.maximumWorld.x - boundingBox.boundingBox.minimumWorld.x;
        let widthY = boundingBox.boundingBox.maximumWorld.y - boundingBox.boundingBox.minimumWorld.y;
        let widthZ = boundingBox.boundingBox.maximumWorld.z - boundingBox.boundingBox.minimumWorld.z;
        this.options.selection.selected.forEach((node, i) => {
            //TODO: Investigate why divide by 6 works
            this.animateScale((node as TransformNode), new Vector3(widthX / 6, widthY / 6, widthZ / 6));
        })
        return this;
    }

    // public planeLayout = planeLayout;
    // public cylinderLayout = cylinderLayout;
    // public cockpitLayout = cockpitLayout
    
}

export function planeLayout(name: string, options: LayoutOptions, scene: Scene): Layout {

    const Options: LayoutOptions = {
        selection: options.selection,
        rows: options.rows || 1,
        columns: options.columns || options.selection.selected.length,
        margin: options.margin || new Vector2(0, 0),
        order: options.order || [],
    }
 
    return new Layout(name, Options, scene).planeLayout();

}

export function cylinderLayout(name: string, options: LayoutOptions, scene: Scene){

    const Options: LayoutOptions = {
        selection: options.selection,
        rows: options.rows || 1,
        columns: options.columns || options.selection.selected.length,
        radius: options.radius || 5,
        margin: options.margin || new Vector2(0, 0),
        order: options.order || [],
    }
 
    return new Layout(name, Options, scene).cylinderLayout();

}

export function cockpitLayout(){}
