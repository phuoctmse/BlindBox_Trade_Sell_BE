import { ObjectId } from "mongodb";

interface ComponentType {
  accessoryId: ObjectId
  color: string
  shape: string
  size: string
}

export default class Components {
  accessoryId: ObjectId
  color: string
  shape: string
  size: string
  constructor(component: ComponentType) {
    this.accessoryId = component.accessoryId
    this.color = component.color
    this.shape = component.shape
    this.size = component.size
  }
}