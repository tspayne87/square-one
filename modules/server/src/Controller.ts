import { HtmlResult, AssetResult, RedirectResult } from './results';

/**
 * Base controller to be extended from.
 */
export class Controller {
    /**
     * The directory that the server is currently running in.
     */
    public _dirname!: string;

    /**
     * Method will send an html string down to the client.
     * 
     * @param html The html string that needs to be sent down to the client.
     */
    public html(html: string): HtmlResult {
        return new HtmlResult(html);
    }

    /**
     * Method will send data down to the client for processing.
     * 
     * @param asset The path to the asset that will be generated and sent to the client, this is based on the location of the controller.
     */
    public asset(asset: string): AssetResult {
        return new AssetResult(asset);
    }

    /**
     * Method is meant to redirect the url to another place.
     * 
     * @param url The url where we need to be redirected to.
     */
    public redirect(url: string): RedirectResult {
        return new RedirectResult(url);
    }
}