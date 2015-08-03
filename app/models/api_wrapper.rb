class GoogleImageWrapper

  API_ROOT_URL = 'http://images.google.com'
  API_KEY = ''

  def self.search_hood_images(hood)
    search_url = [
      API_ROOT_URL,

      URI.escape(hood),
      API_KEY
    ].join

    response = HTTParty.get(search_url)
    binding.pry

    response
  end

end
