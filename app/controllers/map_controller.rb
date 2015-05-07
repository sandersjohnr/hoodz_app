# Serves the Data for the Map
class MapController < ApplicationController
  def index
  end

  def data
    respnd_to do |format|
      format.json {
        render :json => [1,2,3,4,5]
      }
  end
end
