import { Request, Response } from "express"
export type Controller = (req: Request, res: Response, renderView: (view: string, data: any) => void) => void
