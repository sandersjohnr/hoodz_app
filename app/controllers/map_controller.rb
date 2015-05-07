# Serves the Data for the Map
class MapController < ApplicationController
  def index
  end

  def data  
    dataset = (1..20).to_a
    respond_to do |format|
      format.json {
        render :json => dataset
      }
    end
  end


end
