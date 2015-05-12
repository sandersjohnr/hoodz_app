require 'mechanize'
require 'pry'

mechanize = Mechanize.new

page = mechanize.get('http://images.google.com/')

form = page.forms.first

form['q'] = 'windsor terrace brooklyn'

page = form.submit

  binding.pry
page.search('#rg_s div a').each do |a|
  
end