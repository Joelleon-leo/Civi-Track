const pool = require('../config/db');

const getDepartment = (category) => {
  const mapping = {
    'Electrical': 'Electrical Dept',
    'Sanitation': 'Maintenance',
    'Hostel': 'Hostel Office',
    'IT': 'IT Support',
    'Other': 'General Admin'
  };
  return mapping[category] || 'General Admin';
};

exports.createComplaint = async (req, res) => {
  const { title, description, category, latitude, longitude } = req.body;
  const user_id = req.user.id;
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);

  if (!title || !description || !category || isNaN(lat) || isNaN(lng)) {
    return res.status(400).json({ error: 'Missing or invalid fields' });
  }

  try {
    // Duplicate Detection
    const duplicateQuery = `
      SELECT * FROM Complaints 
      WHERE category = $1
      AND status NOT IN ('Resolved', 'Closed')
      AND (
        6371 * acos(
          cos(radians($2)) *
          cos(radians(latitude)) *
          cos(radians(longitude) - radians($3)) +
          sin(radians($2)) *
          sin(radians(latitude))
        )
      ) < 0.5
      AND title ILIKE $4
      LIMIT 1
    `;
    const searchTitle = `%${title.split(' ')[0]}%`; // rudimentary word match
    
    const duplicateMatch = await pool.query(duplicateQuery, [category, lat, lng, searchTitle]);

    if (duplicateMatch.rows.length > 0) {
      const existing = duplicateMatch.rows[0];
      // Increment support count
      const updated = await pool.query(
        'UPDATE Complaints SET support_count = support_count + 1 WHERE id = $1 RETURNING *',
        [existing.id]
      );
      
      // Also maybe add user to a support table later, but for now just count
      return res.status(200).json({ 
        message: 'Similar complaint found, your support was added to it.', 
        complaint: updated.rows[0] 
      });
    }

    const department = getDepartment(category);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const insertComplaint = await client.query(
        `INSERT INTO Complaints (title, description, category, latitude, longitude, department, user_id) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [title, description, category, lat, lng, department, user_id]
      );
      
      const newComplaint = insertComplaint.rows[0];

      // Insert Initial Status Log
      await client.query(
        `INSERT INTO Status_Logs (complaint_id, status, note, updated_by) VALUES ($1, $2, $3, $4)`,
        [newComplaint.id, 'Submitted', 'Complaint initialized', user_id]
      );

      // Handle Image Uploads
      const files = req.files || [];
      const imageUrls = [];
      for (const file of files) {
        const url = `/uploads/${file.filename}`;
        await client.query(
          `INSERT INTO Complaint_Images (complaint_id, image_url) VALUES ($1, $2)`,
          [newComplaint.id, url]
        );
        imageUrls.push(url);
      }
      
      await client.query('COMMIT');
      
      res.status(201).json({ ...newComplaint, images: imageUrls });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Create complaint error', err);
    res.status(500).json({ error: 'Server error processing complaint' });
  }
};

exports.getComplaints = async (req, res) => {
  try {
    const { category, status } = req.query;
    let query = `
      SELECT c.*, u.name as reporter_name 
      FROM Complaints c
      JOIN Users u ON c.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (category) {
      query += ` AND c.category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (status) {
      query += ` AND c.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    // For Authority, could filter by their department, but let's keep it simple or implement if needed
    // if (req.user.role === 'authority') {
    //    // filter by assigned department 
    // }

    query += ` ORDER BY c.created_at DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Get complaints error', err);
    res.status(500).json({ error: 'Server error fetching complaints' });
  }
};

exports.getComplaintById = async (req, res) => {
  const { id } = req.params;
  try {
    const complaintRes = await pool.query(`
      SELECT c.*, u.name as reporter_name 
      FROM Complaints c
      JOIN Users u ON c.user_id = u.id
      WHERE c.id = $1
    `, [id]);

    if (complaintRes.rows.length === 0) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    const imagesRes = await pool.query('SELECT image_url FROM Complaint_Images WHERE complaint_id = $1', [id]);
    const logsRes = await pool.query(`
      SELECT s.*, u.name as updater_name 
      FROM Status_Logs s 
      LEFT JOIN Users u ON s.updated_by = u.id 
      WHERE s.complaint_id = $1 
      ORDER BY s.timestamp ASC
    `, [id]);

    const complaint = complaintRes.rows[0];
    complaint.images = imagesRes.rows.map(row => row.image_url);
    complaint.logs = logsRes.rows;

    res.json(complaint);
  } catch (err) {
    console.error('Get complaint by id error', err);
    res.status(500).json({ error: 'Server error fetching complaint details' });
  }
};

exports.updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status, note } = req.body;
  const user_id = req.user.id;

  const validStatuses = ['Submitted', 'Assigned', 'In Progress', 'Resolved', 'Closed'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const updateRes = await client.query(
      'UPDATE Complaints SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (updateRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Complaint not found' });
    }

    await client.query(
      `INSERT INTO Status_Logs (complaint_id, status, note, updated_by) VALUES ($1, $2, $3, $4)`,
      [id, status, note || '', user_id]
    );

    await client.query('COMMIT');
    res.json(updateRes.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Update status error', err);
    res.status(500).json({ error: 'Server error updating status' });
  } finally {
    client.release();
  }
};
