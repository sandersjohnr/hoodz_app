class CreateUsers < ActiveRecord::Migration
  def change
    create_table :users do |t|
      t.string :username
      t.string :password_digest
      t.string :first_name
      t.integer :games_won
      t.integer :games_lost

      t.timestamps
    end
  end
end
