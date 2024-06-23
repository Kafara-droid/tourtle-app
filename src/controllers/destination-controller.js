const { db, auth } = require('../config/firebase');

class DestinasiController {
  createDestinasi(req, res) {
    const {
      Description,
      Category,
      Place_Id,
      Place_Name,
      Coordinate,
      Rating,
      Long,
      City,
      Lat
    } = req.body;

    if (!Description || !Category || !Place_Id || !Place_Name || !Coordinate || !Rating || !Long || !City || !Lat) {
      return res.status(422).json({
        Description: !Description ? "Description is required" : undefined,
        Category: !Category ? "Category is required" : undefined,
        Place_Id: !Place_Id ? "Place_Id is required" : undefined,
        Place_Name: !Place_Name ? "Place_Name is required" : undefined,
        Coordinate: !Coordinate ? "Coordinate is required" : undefined,
        Rating: !Rating ? "Rating is required" : undefined,
        Long: !Long ? "Long is required" : undefined,
        City: !City ? "City is required" : undefined,
        Lat: !Lat ? "Lat is required" : undefined,
      });
    }

    const newDestinasi = {
      Description,
      Category,
      Place_Id,
      Place_Name,
      Coordinate,
      Rating,
      Long,
      City,
      Lat,
      createdAt: new Date().toISOString(),
    };

    db.collection("destinations")
      .add(newDestinasi)
      .then((docRef) => {
        res.status(201).json({ message: "Destination created successfully", id: docRef.id });
      })
      .catch((error) => {
        console.error("Error adding document: ", error);
        res.status(500).json({ error: "An error occurred while creating the destination" });
      });
  }

  getDestinasi(req, res) {
    const { id } = req.params;

    db.collection("destinations")
      .doc(id)
      .get()
      .then((doc) => {
        if (!doc.exists) {
          return res.status(404).json({ error: "Destination not found" });
        }
        res.status(200).json(doc.data());
      })
      .catch((error) => {
        console.error("Error getting document: ", error);
        res.status(500).json({ error: "An error occurred while fetching the destination" });
      });
  }

  getAllDestinasi(req, res) {
    db.collection("destinations")
      .get()
      .then((snapshot) => {
        const destinations = [];
        snapshot.forEach((doc) => {
          destinations.push({ id: doc.id, ...doc.data() });
        });
        res.status(200).json(destinations);
      })
      .catch((error) => {
        console.error("Error getting documents: ", error);
        res.status(500).json({ error: "An error occurred while fetching the destinations" });
      });
  }

  updateDestinasi(req, res) {
    const { id } = req.params;
    const { Description, Category, Place_Id, Place_Name, Coordinate, Rating, Long, City, Lat } = req.body;

    const updateData = {};
    if (Description) updateData.Description = Description;
    if (Category) updateData.Category = Category;
    if (Place_Id) updateData.Place_Id = Place_Id;
    if (Place_Name) updateData.Place_Name = Place_Name;
    if (Coordinate) updateData.Coordinate = Coordinate;
    if (Rating) updateData.Rating = Rating;
    if (Long) updateData.Long = Long;
    if (City) updateData.City = City;
    if (Lat) updateData.Lat = Lat;

    db.collection("destinations")
      .doc(id)
      .update(updateData)
      .then(() => {
        res.status(200).json({ message: "Destination updated successfully" });
      })
      .catch((error) => {
        console.error("Error updating document: ", error);
        res.status(500).json({ error: "An error occurred while updating the destination" });
      });
}


  deleteDestinasi(req, res) {
    const { id } = req.params;

    db.collection("destinations")
      .doc(id)
      .delete()
      .then(() => {
        res.status(200).json({ message: "Destination deleted successfully" });
      })
      .catch((error) => {
        console.error("Error deleting document: ", error);
        res.status(500).json({ error: "An error occurred while deleting the destination" });
      });
  }
}

module.exports = new DestinasiController();
