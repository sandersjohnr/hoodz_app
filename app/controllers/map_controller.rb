# Serves the Data for the Map
class MapController < ApplicationController
  def index
  end

  def data  
    
    dataset = [1,2,3,4,5]

    respond_to do |format|
      format.json {
        render :json => dataset
      }
    end
  end
end
